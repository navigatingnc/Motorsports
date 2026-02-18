import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VehicleListPage from './pages/VehicleListPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container">
            <h1 className="navbar-brand">🏁 Motorsports Management</h1>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            <Route path="/vehicles" element={<VehicleListPage />} />
            {/* Placeholder routes for future phases */}
            <Route path="/vehicles/:id" element={<div>Vehicle Detail (Coming Soon)</div>} />
            <Route path="/vehicles/:id/edit" element={<div>Edit Vehicle (Coming Soon)</div>} />
            <Route path="/vehicles/new" element={<div>New Vehicle (Coming Soon)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
