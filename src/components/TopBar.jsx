import React from 'react';
import { useLocation } from 'react-router-dom';

function TopBar({ user, onLogout }) {
  const location = useLocation();

  const getTitleFromPath = () => {
    const pathMap = {
      '/dashboard': 'Dashboard',
      '/candidates': 'Candidate Pipeline',
      '/offer-letters': 'Offer Letters',
      '/salary-structure': 'Salary Structure',
      '/policies': 'Policy Management',
      '/onboarding': 'Onboarding',
      '/induction': 'Induction Schedule',
      '/reports': 'Reports & Analytics',
      '/users': 'User Management',
    };
    return pathMap[location.pathname] || 'HR Post-Selection Manager';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="top-bar">
      <div className="top-bar-title">{getTitleFromPath()}</div>
      <div className="user-info">
        <div className="user-avatar">{getInitials(user?.name || 'User')}</div>
        <div className="user-details">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
