import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OfferLetters.css';

function OfferLetters({ user }) {
  const [candidates, setCandidates] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [formData, setFormData] = useState({
    candidateId: '',
    joiningDate: '',
    reportingManager: '',
    hiringType: 'Permanent',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE = '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesRes, offersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/candidates`),
        axios.get(`${API_BASE}/api/offer-letters`),
      ]);
      setCandidates(candidatesRes.data);
      setOffers(offersRes.data);
    } catch (error) {
      setError('Error fetching data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerateOffer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE}/api/offer-letters`, formData);
      setSuccess('Offer letter generated successfully');
      fetchData();
      setShowModal(false);
      setFormData({
        candidateId: '',
        joiningDate: '',
        reportingManager: '',
        hiringType: 'Permanent',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error generating offer');
    }
  };

  const handleSendOffer = async (offerId) => {
    try {
      await axios.post(
        `${API_BASE}/api/offer-letters/${offerId}/send`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSuccess('Offer letter sent via email');
      fetchData();
    } catch (err) {
      setError('Error sending offer');
    }
  };

  const handleUpdateAcceptance = async (offerId, status) => {
    try {
      await axios.put(`${API_BASE}/api/offer-letters/${offerId}/acceptance`, {
        status,
      });
      setSuccess(`Offer marked as ${status}`);
      fetchData();
    } catch (err) {
      setError('Error updating offer status');
    }
  };

  const getEligibleCandidates = () => {
    return candidates.filter(
      (c) =>
        c.hiring_status === 'Feedback Submitted' ||
        c.hiring_status === 'Selected'
    );
  };

  const getCandidateOffers = (candidateId) => {
    return offers.filter((o) => o.candidate_id === candidateId);
  };

  if (loading) return <div className="page-container">Loading...</div>;

  const eligibleCandidates = getEligibleCandidates();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Offer Letters</h1>
        <p className="page-subtitle">Generate and manage offer letters</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <span>Candidates Ready for Offers ({eligibleCandidates.length})</span>
          {user?.role === 'HR Manager' && (
            <button className="btn btn-primary btn-small" onClick={() => setShowModal(true)}>
              📄 Generate Offer
            </button>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Offers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {eligibleCandidates.map((candidate) => {
                const candidateOffers = getCandidateOffers(candidate.id);
                return (
                  <tr key={candidate.id}>
                    <td>{candidate.name}</td>
                    <td>{candidate.email}</td>
                    <td>{candidate.role}</td>
                    <td>
                      <span className="status-badge status-submitted">
                        {candidate.hiring_status}
                      </span>
                    </td>
                    <td>{candidateOffers.length}</td>
                    <td>
                      {user?.role === 'HR Manager' && (
                        <>
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setFormData({ ...formData, candidateId: candidate.id });
                              setShowModal(true);
                            }}
                          >
                            Generate
                          </button>
                          {candidateOffers.length > 0 && (
                            <button
                              className="btn btn-success btn-small"
                              onClick={() => handleSendOffer(candidateOffers[0].id)}
                              style={{ marginLeft: '5px' }}
                            >
                              Send
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Letters List */}
      <div className="card" style={{ marginTop: '30px' }}>
        <div className="card-header">All Offer Letters</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Hiring Type</th>
                <th>Generated</th>
                <th>Sent</th>
                <th>Acceptance</th>
                <th>Version</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const candidate = candidates.find((c) => c.id === offer.candidate_id);
                return (
                  <tr key={offer.id}>
                    <td>{candidate?.name || 'Unknown'}</td>
                    <td>{offer.hiring_type || '-'}</td>
                    <td>{new Date(offer.generated_at).toLocaleDateString()}</td>
                    <td>{offer.sent_at ? new Date(offer.sent_at).toLocaleDateString() : '-'}</td>
                    <td>
                      <span
                        className={`status-badge status-${offer.acceptance_status?.toLowerCase()}`}
                      >
                        {offer.acceptance_status}
                      </span>
                    </td>
                    <td>v{offer.version}</td>
                    <td>
                      {user?.role === 'HR Manager' && (
                        <>
                          <button className="btn btn-secondary btn-small">View</button>
                          {offer.acceptance_status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-success btn-small"
                                onClick={() => handleUpdateAcceptance(offer.id, 'Accepted')}
                                style={{ marginLeft: '5px' }}
                              >
                                Accept
                              </button>
                              <button
                                className="btn btn-danger btn-small"
                                onClick={() => handleUpdateAcceptance(offer.id, 'Declined')}
                                style={{ marginLeft: '5px' }}
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Offer Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              Generate Offer Letter {selectedCandidate && `- ${selectedCandidate.name}`}
            </div>
            <form onSubmit={handleGenerateOffer}>
              <div className="form-group">
                <label>Candidate</label>
                <select
                  name="candidateId"
                  value={formData.candidateId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Candidate</option>
                  {eligibleCandidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Hiring Type</label>
                <select
                  name="hiringType"
                  value={formData.hiringType}
                  onChange={handleChange}
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label>Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reporting Manager</label>
                <input
                  type="text"
                  name="reportingManager"
                  value={formData.reportingManager}
                  onChange={handleChange}
                  placeholder="Manager name"
                  required
                />
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
                  Generate Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfferLetters;
