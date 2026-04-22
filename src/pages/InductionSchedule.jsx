import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InductionSchedule({ user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    scheduledDate: '',
    venueOrLink: '',
    agenda: '',
  });

  const API_BASE = '';

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/induction-sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/induction-sessions`, formData);
      fetchSessions();
      setShowModal(false);
      setFormData({ title: '', scheduledDate: '', venueOrLink: '', agenda: '' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Induction Schedule</h1>
        <p className="page-subtitle">Schedule and manage induction sessions</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span>Induction Sessions ({sessions.length})</span>
          {user?.role === 'HR Manager' || user?.role === 'Super Admin' ? (
            <button className="btn btn-primary btn-small" onClick={() => setShowModal(true)}>
              ➕ Schedule Session
            </button>
          ) : null}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date & Time</th>
                <th>Venue/Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.title}</td>
                  <td>{new Date(session.scheduled_date).toLocaleString()}</td>
                  <td>{session.venue_or_link}</td>
                  <td>
                    <button className="btn btn-secondary btn-small">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">Schedule Induction Session</div>
            <form onSubmit={handleAddSession}>
              <div className="form-group">
                <label>Session Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Venue or Zoom Link</label>
                <input
                  type="text"
                  value={formData.venueOrLink}
                  onChange={(e) => setFormData({ ...formData, venueOrLink: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Agenda</label>
                <textarea
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InductionSchedule;
