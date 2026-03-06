import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const SOCKET_URL =
  (import.meta.env['VITE_API_URL'] as string | undefined)?.replace('/api', '') ??
  'http://localhost:3000';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // ── Fetch existing notifications from REST API ──────────────────────────
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, [isAuthenticated]);

  // ── Socket.IO connection ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // New notification pushed from server
    socket.on('notifications:new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
    });

    // Single notification marked read (via socket event echo)
    socket.on('notifications:marked', ({ id }: { id: string }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    });

    // All notifications marked read
    socket.on('notifications:allMarked', () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    // Initial load
    void refresh();

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user, refresh]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const markRead = useCallback(async (id: string) => {
    await notificationService.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const dismiss = useCallback(async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isConnected, markRead, markAllRead, dismiss, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};
