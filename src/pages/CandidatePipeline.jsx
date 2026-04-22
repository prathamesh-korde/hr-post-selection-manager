import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CandidatePipeline.css';

function CandidatePipeline({ user }) {
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    source: 'Portal',
  });
  const [feedbackData, setFeedbackData] = useState({
    round: 'HR',
    technicalRating: 3,
    behavioralRating: 3,
    comments: '',
    decision: 'Go',
  });

  const API_BASE = '';
  const statuses = ['Applied', 'Shortlisted', 'HR Round', 'Final Round', 'Feedback Submitted', 'Selected', 'Rejected'];

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/candidates`);
      setCandidates(response.data);
    } catch (error) {
      setError('Error fetching candidates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData({ ...feedbackData, [name]: value });
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (user?.role !== 'Recruiter' && user?.role !== 'HR Manager' && user?.role !== 'Super Admin') {
      setError('You do not have permission to add candidates');
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/candidates`, formData);
      setSuccess('Candidate added successfully');
      fetchCandidates();
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', role: '', source: 'Portal' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding candidate');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (user?.role !== 'Recruiter' && user?.role !== 'Interviewer' && user?.role !== 'HR Manager') {
      setError('You do not have permission to submit feedback');
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/feedback`, {
        candidateId: selectedCandidate.id,
        ...feedbackData,
        submittedBy: user.id,
      });
      setSuccess('Feedback submitted successfully');
      fetchCandidates();
      setShowFeedbackModal(false);
      setFeedbackData({
        round: 'HR',
        technicalRating: 3,
        behavioralRating: 3,
        comments: '',
        decision: 'Go',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting feedback');
    }
  };

  const handleUpdateStatus = async (candidateId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/api/candidates/${candidateId}`, {
        hiring_status: newStatus,
      });
      setSuccess('Candidate status updated');
      fetchCandidates();
    } catch (err) {
      setError('Error updating status');
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Applied': 'status-applied',
      'Shortlisted': 'status-shortlisted',
      'HR Round': 'status-hr',
      'Final Round': 'status-final',
      'Feedback Submitted': 'status-submitted',
      'Selected': 'status-selected',
      'Rejected': 'status-rejected',
    };
    return statusMap[status] || 'status-applied';
  };

  const filteredCandidates =
    filterStatus === 'All'
      ? candidates
      : candidates.filter((c) => c.hiring_status === filterStatus);

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  const canAddCandidate = user?.role === 'Recruiter' || user?.role === 'HR Manager' || user?.role === 'Super Admin';
  const canSubmitFeedback = user?.role === 'Recruiter' || user?.role === 'Interviewer' || user?.role === 'HR Manager' || user?.role === 'Super Admin';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Candidate Pipeline</h1>
        <p className="page-subtitle">Manage candidates through hiring process</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        {canAddCandidate && (
          <button className="btn btn-primary btn-small" onClick={() => setShowModal(true)}>
            ➕ Add Candidate
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span>Candidates ({filteredCandidates.length})</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Source</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.phone}</td>
                  <td>{candidate.role}</td>
                  <td>{candidate.source || 'Portal'}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(candidate.hiring_status)}`}>
                      {candidate.hiring_status}
                    </span>
                  </td>
                  <td>{new Date(candidate.applied_at).toLocaleDateString()}</td>
                  <td>
                    {canSubmitFeedback && (
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setShowFeedbackModal(true);
                        }}
                      >
                        {user?.role === 'Interviewer' ? '💬 Comment' : '📝 Feedback'}
                      </button>
                    )}
                    {(user?.role === 'Recruiter' || user?.role === 'HR Manager' || user?.role === 'Super Admin') && (
                      <select
                        className="status-select"
                        value={candidate.hiring_status}
                        onChange={(e) => handleUpdateStatus(candidate.id, e.target.value)}
                        style={{ marginLeft: '5px' }}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">Add New Candidate</div>
            <form onSubmit={handleAddCandidate}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g., Senior Developer"
                  required
                />
              </div>
              <div className="form-group">
                <label>Source</label>
                <select name="source" value={formData.source} onChange={handleChange}>
                  <option value="Portal">Portal</option>
                  <option value="Referral">Referral</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Recruiter">Recruiter</option>
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedCandidate && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              {user?.role === 'Interviewer' ? 'Add Comment' : 'Submit Feedback'} - {selectedCandidate.name}
            </div>
            <form onSubmit={handleSubmitFeedback}>
              <div className="form-group">
                <label>Round</label>
                <select name="round" value={feedbackData.round} onChange={handleFeedbackChange}>
                  <option value="HR">HR Round</option>
                  <option value="Final">Final Round</option>
                </select>
              </div>

              {user?.role !== 'Interviewer' && (
                <>
                  <div className="form-group">
                    <label>Technical Rating (1-5)</label>
                    <input
                      type="number"
                      name="technicalRating"
                      min="1"
                      max="5"
                      value={feedbackData.technicalRating}
                      onChange={handleFeedbackChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Behavioral Rating (1-5)</label>
                    <input
                      type="number"
                      name="behavioralRating"
                      min="1"
                      max="5"
                      value={feedbackData.behavioralRating}
                      onChange={handleFeedbackChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Decision</label>
                    <select name="decision" value={feedbackData.decision} onChange={handleFeedbackChange}>
                      <option value="Go">Go</option>
                      <option value="No-Go">No-Go</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Comments</label>
                <textarea
                  name="comments"
                  value={feedbackData.comments}
                  onChange={handleFeedbackChange}
                  rows="4"
                  placeholder="Enter feedback comments..."
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {user?.role === 'Interviewer' ? 'Add Comment' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidatePipeline;
