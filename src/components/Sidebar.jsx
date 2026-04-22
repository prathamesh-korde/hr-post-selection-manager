import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ user, onLogout }) {
  const location = useLocation();

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/candidates', label: 'Candidate Pipeline' },
    ];

    const hrManagerItems = [
      { path: '/offer-letters', label: 'Offer Letters' },
      { path: '/salary-structure', label: 'Salary Structure' },
      { path: '/onboarding', label: 'Onboarding' },
      { path: '/induction', label: 'Induction Schedule' },
      { path: '/policies', label: 'Policies' },
    ];

    const adminItems = [
      { path: '/users', label: 'User Management' },
    ];

    const reportItems = [
      { path: '/reports', label: 'Reports & Analytics' },
    ];

    let items = [...baseItems];

    if (user?.role === 'HR Manager' || user?.role === 'Super Admin') {
      items = [...items, ...hrManagerItems];
    }

    if (user?.role === 'Super Admin') {
      items = [...items, ...adminItems];
    }

    items = [...items, ...reportItems];

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span>🏢 HR Manager</span>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
