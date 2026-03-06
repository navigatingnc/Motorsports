import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import prisma from '../prisma';
import { JwtPayload } from '../types/auth.types';
import { CreateNotificationDto, NotificationPayload } from '../types/notification.types';

let io: SocketIOServer | null = null;

/**
 * Map of userId → Set of connected socket IDs.
 * Allows targeting all active sessions for a given user.
 */
const userSockets = new Map<string, Set<string>>();

// ── Socket.IO initialisation ─────────────────────────────────────────────────

/**
 * Attach a Socket.IO server to the existing HTTP server.
 * Performs JWT authentication on every incoming connection.
 */
export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  const allowedOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── JWT auth middleware ───────────────────────────────────────────────────
  io.use((socket: Socket, next) => {
    const token =
      (socket.handshake.auth as Record<string, string>)['token'] ??
      (socket.handshake.headers['authorization'] as string | undefined)?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: no token provided'));
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      return next(new Error('Server configuration error'));
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      // Attach user info to the socket for later use
      (socket as Socket & { user: JwtPayload }).user = decoded;
      next();
    } catch {
      next(new Error('Authentication error: invalid or expired token'));
    }
  });

  // ── Connection handler ────────────────────────────────────────────────────
  io.on('connection', (socket: Socket) => {
    const user = (socket as Socket & { user: JwtPayload }).user;
    logger.info({ userId: user.userId, socketId: socket.id }, 'Socket connected');

    // Track this socket under the user's ID
    if (!userSockets.has(user.userId)) {
      userSockets.set(user.userId, new Set());
    }
    userSockets.get(user.userId)!.add(socket.id);

    // Join a personal room so we can target the user directly
    void socket.join(`user:${user.userId}`);

    // ── Client events ─────────────────────────────────────────────────────
    socket.on('notifications:markRead', async (notificationId: string) => {
      try {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });
        socket.emit('notifications:marked', { id: notificationId });
      } catch (err) {
        logger.error({ err }, 'Failed to mark notification as read');
      }
    });

    socket.on('notifications:markAllRead', async () => {
      try {
        await prisma.notification.updateMany({
          where: { recipientId: user.userId, isRead: false },
          data: { isRead: true },
        });
        socket.emit('notifications:allMarked');
      } catch (err) {
        logger.error({ err }, 'Failed to mark all notifications as read');
      }
    });

    socket.on('disconnect', () => {
      logger.info({ userId: user.userId, socketId: socket.id }, 'Socket disconnected');
      userSockets.get(user.userId)?.delete(socket.id);
      if (userSockets.get(user.userId)?.size === 0) {
        userSockets.delete(user.userId);
      }
    });
  });

  logger.info('🔌 Socket.IO server initialised');
  return io;
}

// ── Notification helpers ──────────────────────────────────────────────────────

/**
 * Persist a notification to the database and emit it in real-time
 * to the recipient's active Socket.IO sessions (if any).
 */
export async function sendNotification(dto: CreateNotificationDto): Promise<NotificationPayload> {
  const notification = await prisma.notification.create({
    data: {
      recipientId: dto.recipientId,
      message: dto.message,
      type: dto.type ?? 'system',
    },
  });

  // Emit to all active sessions for this user
  if (io) {
    io.to(`user:${dto.recipientId}`).emit('notifications:new', notification);
  }

  logger.info(
    { notificationId: notification.id, recipientId: dto.recipientId, type: notification.type },
    'Notification sent',
  );

  return notification;
}

/**
 * Broadcast a notification to every currently connected user.
 * Useful for system-wide announcements.
 */
export async function broadcastNotification(
  message: string,
  type: CreateNotificationDto['type'] = 'system',
): Promise<void> {
  // Persist for every connected user
  const recipientIds = Array.from(userSockets.keys());
  if (recipientIds.length === 0) return;

  await prisma.notification.createMany({
    data: recipientIds.map((recipientId) => ({ recipientId, message, type: type ?? 'system' })),
  });

  // Emit to all rooms
  if (io) {
    io.emit('notifications:new', { message, type, isRead: false, createdAt: new Date() });
  }
}

/**
 * Notify all admins of a low-stock part alert.
 */
export async function notifyLowStock(partName: string, quantity: number): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { role: 'admin', isActive: true },
    select: { id: true },
  });

  await Promise.all(
    admins.map((admin: { id: string }) =>
      sendNotification({
        recipientId: admin.id,
        message: `⚠️ Low stock alert: "${partName}" has only ${quantity} unit(s) remaining.`,
        type: 'low_stock',
      }),
    ),
  );
}

/**
 * Notify all users that a new setup sheet has been created for an event.
 */
export async function notifyNewSetupSheet(
  eventName: string,
  vehicleName: string,
  sessionType: string,
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  await Promise.all(
    users.map((u: { id: string }) =>
      sendNotification({
        recipientId: u.id,
        message: `📋 New setup sheet created for ${eventName} — ${vehicleName} (${sessionType}).`,
        type: 'setup_sheet',
      }),
    ),
  );
}

/**
 * Notify all users about an upcoming event starting soon.
 */
export async function notifyEventReminder(eventName: string, venue: string): Promise<void> {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  await Promise.all(
    users.map((u: { id: string }) =>
      sendNotification({
        recipientId: u.id,
        message: `🏁 Reminder: "${eventName}" at ${venue} is starting soon!`,
        type: 'event_reminder',
      }),
    ),
  );
}

export { io };
