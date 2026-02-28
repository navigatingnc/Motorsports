import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import VehicleListPage from './pages/VehicleListPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import VehicleFormPage from './pages/VehicleFormPage';
import EventListPage from './pages/EventListPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import DriversPage from './pages/DriversPage';
import AdminPanelPage from './pages/AdminPanelPage';
import PartsPage from './pages/PartsPage';
import './App.css';
import './dark-mode.css';

// Inner component that has access to the Router context
const AppLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isAdmin = user?.role === 'admin';
  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-container navbar-container--flex">
          <h1 className="navbar-brand">🏁 Motorsports Management</h1>
          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li>
                  <NavLink
                    to="/vehicles"
                    className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
                  >
                    Vehicles
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/events"
                    className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
                  >
                    Events
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/drivers"
                    className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
                  >
                    Drivers
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/analytics"
                    className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
                  >
                    Analytics
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/parts"
                    className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
                  >
                    Parts
                  </NavLink>
                </li>
                {isAdmin && (
                  <li>
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => isActive ? 'nav-link nav-link--active nav-link--admin' : 'nav-link nav-link--admin'}
                    >
                      Admin
                    </NavLink>
                  </li>
                )}
                <li className="nav-user-info">
                  <span className="nav-user-name">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className={`nav-user-role nav-user-role--${user?.role}`}>{user?.role}</span>
                </li>
                <li>
                  <ThemeToggle />
                </li>
                <li>
                  <button onClick={handleLogout} className="btn-logout">
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <ThemeToggle />
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
                  >
                    Sign In
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/register"
                    className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
                  >
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/vehicles" replace />
              </ProtectedRoute>
            }
          />

          {/* Vehicle routes — /vehicles/new MUST come before /vehicles/:id */}
          <Route
            path="/vehicles/new"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'user']}>
                  <VehicleFormPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <VehicleListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id/edit"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'user']}>
                  <VehicleFormPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <ProtectedRoute>
                <VehicleDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Event routes — /events/new MUST come before /events/:id */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/new"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'user']}>
                  <div className="container"><p>New Event (Coming Soon)</p></div>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'user']}>
                  <div className="container"><p>Edit Event (Coming Soon)</p></div>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Drivers */}
          <Route
            path="/drivers"
            element={
              <ProtectedRoute>
                <DriversPage />
              </ProtectedRoute>
            }
          />

          {/* Analytics Dashboard */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Parts & Inventory */}
          <Route
            path="/parts"
            element={
              <ProtectedRoute>
                <PartsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Panel — admin role only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <AdminPanelPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
