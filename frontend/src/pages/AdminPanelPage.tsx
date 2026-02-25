import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import type { AdminUser } from '../types/admin';
import { VALID_ROLES } from '../types/admin';

const AdminPanelPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load users.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-dismiss success messages
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId);
      setError(null);
      const updated = await adminService.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      setSuccessMsg(`Role updated to "${newRole}" successfully.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update role.';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      setError(null);
      const updated = await adminService.toggleUserStatus(userId, !currentStatus);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      setSuccessMsg(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update status.';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Admin Panel</h1>
          <p className="admin-subtitle">Manage users, roles, and account status</p>
        </div>
        <div className="admin-stats">
          <span className="admin-stat">
            <strong>{users.length}</strong> Total Users
          </span>
          <span className="admin-stat">
            <strong>{users.filter((u) => u.isActive).length}</strong> Active
          </span>
          <span className="admin-stat">
            <strong>{users.filter((u) => u.role === 'admin').length}</strong> Admins
          </span>
        </div>
      </div>

      {successMsg && <div className="admin-success">{successMsg}</div>}
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Driver Profile</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = currentUser?.id === user.id;
              const isLoading = actionLoading === user.id;

              return (
                <tr key={user.id} className={!user.isActive ? 'admin-row--inactive' : ''}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-avatar">
                        <span className="admin-user-initials">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="admin-user-name">
                          {user.firstName} {user.lastName}
                          {isSelf && <span className="admin-you-badge">You</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-email">{user.email}</td>
                  <td>
                    <select
                      className="admin-role-select"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isSelf || isLoading}
                    >
                      {VALID_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span
                      className={`admin-status-badge ${
                        user.isActive ? 'admin-status--active' : 'admin-status--inactive'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {user.driver ? (
                      <span className="admin-driver-badge">
                        {user.driver.nationality || 'Driver'}
                        {user.driver.licenseNumber && ` #${user.driver.licenseNumber}`}
                      </span>
                    ) : (
                      <span className="admin-no-driver">No profile</span>
                    )}
                  </td>
                  <td className="admin-date">{formatDate(user.createdAt)}</td>
                  <td>
                    <button
                      className={`btn-sm ${user.isActive ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => handleStatusToggle(user.id, user.isActive)}
                      disabled={isSelf || isLoading}
                      title={isSelf ? 'Cannot change your own status' : ''}
                    >
                      {isLoading ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && (
        <div className="empty-state">
          <p>No users found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
