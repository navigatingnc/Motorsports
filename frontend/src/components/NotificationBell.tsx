import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import type { Notification } from '../types/notification';

// ── Icon helpers ──────────────────────────────────────────────────────────────
const typeIcon: Record<string, string> = {
  setup_sheet: '📋',
  event_reminder: '🏁',
  low_stock: '⚠️',
  system: '🔔',
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────
const NotificationBell = () => {
  const { notifications, unreadCount, isConnected, markRead, markAllRead, dismiss } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkRead = async (n: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!n.isRead) await markRead(n.id);
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dismiss(id);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-bell__btn"
        onClick={handleBellClick}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        title="Notifications"
      >
        <span className="notification-bell__icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {isConnected && <span className="notification-bell__dot" title="Live" />}
      </button>

      {isOpen && (
        <div className="notification-dropdown" role="dialog" aria-label="Notifications panel">
          <div className="notification-dropdown__header">
            <span className="notification-dropdown__title">Notifications</span>
            {unreadCount > 0 && (
              <button
                className="notification-dropdown__mark-all"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-dropdown__list">
            {notifications.length === 0 ? (
              <div className="notification-dropdown__empty">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item${n.isRead ? '' : ' notification-item--unread'}`}
                  onClick={(e) => handleMarkRead(n, e)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleMarkRead(n, e as unknown as React.MouseEvent);
                  }}
                >
                  <span className="notification-item__icon">
                    {typeIcon[n.type] ?? '🔔'}
                  </span>
                  <div className="notification-item__body">
                    <p className="notification-item__message">{n.message}</p>
                    <span className="notification-item__time">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <button
                    className="notification-item__dismiss"
                    onClick={(e) => handleDismiss(n.id, e)}
                    aria-label="Dismiss notification"
                    title="Dismiss"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
