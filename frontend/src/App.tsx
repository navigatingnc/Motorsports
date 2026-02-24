import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import VehicleListPage from './pages/VehicleListPage';
import EventListPage from './pages/EventListPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import './App.css';

// Inner component that has access to the Router context
const AppLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
                    to="/analytics"
                    className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
                  >
                    Analytics
                  </NavLink>
                </li>
                <li className="nav-user-info">
                  <span className="nav-user-name">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="nav-user-role">{user?.role}</span>
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
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <VehicleListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <ProtectedRoute>
                <div className="container"><p>Vehicle Detail (Coming Soon)</p></div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id/edit"
            element={
              <ProtectedRoute>
                <div className="container"><p>Edit Vehicle (Coming Soon)</p></div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/new"
            element={
              <ProtectedRoute>
                <div className="container"><p>New Vehicle (Coming Soon)</p></div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventListPage />
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
            path="/events/new"
            element={
              <ProtectedRoute>
                <div className="container"><p>New Event (Coming Soon)</p></div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute>
                <div className="container"><p>Edit Event (Coming Soon)</p></div>
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
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
