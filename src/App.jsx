import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CandidatePipeline from './pages/CandidatePipeline';
import OfferLetters from './pages/OfferLetters';
import SalaryStructure from './pages/SalaryStructure';
import PolicyManagement from './pages/PolicyManagement';
import Onboarding from './pages/Onboarding';
import InductionSchedule from './pages/InductionSchedule';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="main-content">
          <TopBar user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/candidates" element={<CandidatePipeline user={user} />} />
            <Route path="/offer-letters" element={<OfferLetters user={user} />} />
            <Route path="/salary-structure" element={<SalaryStructure user={user} />} />
            <Route path="/policies" element={<PolicyManagement user={user} />} />
            <Route path="/onboarding" element={<Onboarding user={user} />} />
            <Route path="/induction" element={<InductionSchedule user={user} />} />
            <Route path="/reports" element={<Reports user={user} />} />
            <Route path="/users" element={<UserManagement user={user} />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
