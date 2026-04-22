import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    pendingFeedback: 0,
    selectedCandidates: 0,
    offersGenerated: 0,
    offersAccepted: 0,
    policiesUploaded: 0,
    usersCount: 0,
    inductionSessions: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = '';

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [candidatesRes, offersRes, policiesRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/candidates`),
        axios.get(`${API_BASE}/api/offer-letters`),
        axios.get(`${API_BASE}/api/policies`),
        axios.get(`${API_BASE}/api/users`),
      ]);

      const candidates = candidatesRes.data;
      const offers = offersRes.data;
      const policies = policiesRes.data;
      const users = usersRes.data;

      const pendingFeedback = candidates.filter(
        (c) => c.hiring_status === 'HR Round' || c.hiring_status === 'Final Round'
      ).length;
      const selectedCandidates = candidates.filter((c) => c.hiring_status === 'Selected').length;
      const offersAccepted = offers.filter((o) => o.acceptance_status === 'Accepted').length;

      setStats({
        totalCandidates: candidates.length,
        pendingFeedback,
        selectedCandidates,
        offersGenerated: offers.length,
        offersAccepted,
        policiesUploaded: policies.length,
        usersCount: users.length,
        inductionSessions: 0,
      });

      // Create recent activities
      const activities = [];
      candidates.slice(0, 5).forEach((c) => {
        activities.push({
          type: 'candidate',
          message: `${c.name} applied for ${c.role}`,
          time: new Date(c.applied_at),
        });
      });
      setRecentActivities(activities.sort((a, b) => b.time - a.time));
    } catch (error) {
      setError('Error fetching dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'Super Admin':
        return (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#667eea' }}>👥</div>
              <div className="stat-content">
                <p className="stat-label">Total Users</p>
                <p className="stat-value">{stats.usersCount}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#764ba2' }}>📊</div>
              <div className="stat-content">
                <p className="stat-label">System Overview</p>
                <p className="stat-value">Full Access</p>
              </div>
            </div>
          </>
        );
      case 'HR Manager':
        return (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f093fb' }}>📄</div>
              <div className="stat-content">
                <p className="stat-label">Offers Generated</p>
                <p className="stat-value">{stats.offersGenerated}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#4facfe' }}>✓</div>
              <div className="stat-content">
                <p className="stat-label">Offers Accepted</p>
                <p className="stat-value">{stats.offersAccepted}</p>
              </div>
            </div>
          </>
        );
      case 'Recruiter':
        return (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#43e97b' }}>📝</div>
              <div className="stat-content">
                <p className="stat-label">Pending Feedback</p>
                <p className="stat-value">{stats.pendingFeedback}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fa709a' }}>🎯</div>
              <div className="stat-content">
                <p className="stat-label">Selected</p>
                <p className="stat-value">{stats.selectedCandidates}</p>
              </div>
            </div>
          </>
        );
      case 'Interviewer':
        return (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#4facfe' }}>💬</div>
              <div className="stat-content">
                <p className="stat-label">Pending Feedback</p>
                <p className="stat-value">{stats.pendingFeedback}</p>
              </div>
            </div>
          </>
        );
      case 'Candidate':
        return (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#43e97b' }}>📧</div>
              <div className="stat-content">
                <p className="stat-label">Application Status</p>
                <p className="stat-value">In Progress</p>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const getRolePermissions = () => {
    const permissions = {
      'Super Admin': [
        '✓ Manage all users and roles',
        '✓ View and manage all candidates',
        '✓ Generate and manage offer letters',
        '✓ Define salary structures',
        '✓ Upload and manage policies',
        '✓ View all reports and analytics',
        '✓ Configure system settings',
      ],
      'HR Manager': [
        '✓ Generate and send offer letters',
        '✓ Define salary structures',
        '✓ Upload and manage policies',
        '✓ Schedule induction sessions',
        '✓ View candidate feedback',
        '✓ View reports and analytics',
        '✓ Manage onboarding checklists',
      ],
      'Recruiter': [
        '✓ Add and manage candidates',
        '✓ Submit and update feedback',
        '✓ Change candidate hiring status',
        '✓ View offer letters',
        '✓ View reports',
      ],
      'Interviewer': [
        '✓ View candidate profiles',
        '✓ View existing feedback',
        '✓ Add comments to feedback',
        '✓ Limited access to candidate pipeline',
      ],
      'Candidate': [
        '✓ View your profile',
        '✓ View offer letters',
        '✓ Accept or decline offers',
        '✓ Acknowledge company policies',
        '✓ Receive email/SMS notifications',
      ],
    };
    return permissions[user?.role] || [];
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome, {user?.name}! ({user?.role})</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Key Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#667eea' }}>👤</div>
          <div className="stat-content">
            <p className="stat-label">Total Candidates</p>
            <p className="stat-value">{stats.totalCandidates}</p>
          </div>
        </div>

        {getRoleSpecificStats()}
      </div>

      {/* Role-Based Information */}
      <div className="card" style={{ marginTop: '30px' }}>
        <div className="card-header">Your Permissions</div>
        <div className="permissions-list">
          <ul>
            {getRolePermissions().map((perm, index) => (
              <li key={index}>{perm}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="card-header">Recent Activities</div>
          <div className="activities-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-icon">📌</span>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <p className="activity-time">
                    {activity.time.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="card" style={{ marginTop: '30px' }}>
        <div className="card-header">Quick Links</div>
        <div className="quick-links">
          {(user?.role === 'Super Admin' || user?.role === 'HR Manager' || user?.role === 'Recruiter') && (
            <a href="/candidates" className="quick-link">
              👥 Manage Candidates
            </a>
          )}
          {(user?.role === 'Super Admin' || user?.role === 'HR Manager') && (
            <a href="/offers" className="quick-link">
              📄 Offer Letters
            </a>
          )}
          {(user?.role === 'Super Admin' || user?.role === 'HR Manager') && (
            <a href="/salary" className="quick-link">
              💰 Salary Structure
            </a>
          )}
          {(user?.role === 'Super Admin' || user?.role === 'HR Manager') && (
            <a href="/policies" className="quick-link">
              📋 Policies
            </a>
          )}
          {user?.role === 'Super Admin' && (
            <a href="/users" className="quick-link">
              👤 User Management
            </a>
          )}
          {user?.role === 'Candidate' && (
            <a href="/my-profile" className="quick-link">
              👤 My Profile
            </a>
          )}
          {(user?.role === 'Super Admin' || user?.role === 'HR Manager') && (
            <a href="/reports" className="quick-link">
              📊 Reports
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
