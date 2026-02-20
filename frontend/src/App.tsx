import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import VehicleListPage from './pages/VehicleListPage';
import EventListPage from './pages/EventListPage';
import EventDetailPage from './pages/EventDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container navbar-container--flex">
            <h1 className="navbar-brand">🏁 Motorsports Management</h1>
            <ul className="navbar-nav">
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
            </ul>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            <Route path="/vehicles" element={<VehicleListPage />} />
            {/* Placeholder routes for future phases */}
            <Route path="/vehicles/:id" element={<div className="container"><p>Vehicle Detail (Coming Soon)</p></div>} />
            <Route path="/vehicles/:id/edit" element={<div className="container"><p>Edit Vehicle (Coming Soon)</p></div>} />
            <Route path="/vehicles/new" element={<div className="container"><p>New Vehicle (Coming Soon)</p></div>} />
            {/* Event routes */}
            <Route path="/events" element={<EventListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            {/* Placeholder routes for future phases */}
            <Route path="/events/new" element={<div className="container"><p>New Event (Coming Soon)</p></div>} />
            <Route path="/events/:id/edit" element={<div className="container"><p>Edit Event (Coming Soon)</p></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
