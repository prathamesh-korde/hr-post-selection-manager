import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CandidatePortal.css';

function CandidatePortal({ user }) {
  const [candidateData, setCandidateData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [acknowledgedPolicies, setAcknowledgedPolicies] = useState([]);

  const API_BASE = '';

  useEffect(() => {
    if (user?.role === 'Candidate' && user?.id) {
      fetchCandidateData();
    }
  }, [user]);

  const fetchCandidateData = async () => {
    try {
      const [candidateRes, offersRes, policiesRes, communicationsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/candidates/${user.id}`),
        axios.get(`${API_BASE}/api/offer-letters?candidateId=${user.id}`),
        axios.get(`${API_BASE}/api/policies`),
        axios.get(`${API_BASE}/api/communications?candidateId=${user.id}`),
      ]);
      setCandidateData(candidateRes.data);
      setOffers(offersRes.data);
      setPolicies(policiesRes.data);
      setCommunications(communicationsRes.data);
    } catch (error) {
      setError('Error fetching data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      await axios.put(`${API_BASE}/api/offer-letters/${offerId}/acceptance`, {
        status: 'Accepted',
      });
      setSuccess('Offer accepted successfully');
      fetchCandidateData();
    } catch (err) {
      setError('Error accepting offer');
    }
  };

  const handleDeclineOffer = async (offerId) => {
    try {
      await axios.put(`${API_BASE}/api/offer-letters/${offerId}/acceptance`, {
        status: 'Declined',
      });
      setSuccess('Offer declined');
      fetchCandidateData();
    } catch (err) {
      setError('Error declining offer');
    }
  };

  const handleAcknowledgePolicy = async (policyId) => {
    try {
      await axios.post(`${API_BASE}/api/policy-acknowledgments`, {
        candidateId: user.id,
        policyId,
      });
      setSuccess('Policy acknowledged');
      setAcknowledgedPolicies([...acknowledgedPolicies, policyId]);
      fetchCandidateData();
    } catch (err) {
      setError('Error acknowledging policy');
    }
  };

  if (user?.role !== 'Candidate') {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          This page is only accessible to candidates.
        </div>
      </div>
    );
  }

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your application and offers</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Profile Section */}
      {candidateData && (
        <div className="card">
          <div className="card-header">Profile Information</div>
          <div className="profile-info">
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">{candidateData.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{candidateData.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Phone:</span>
              <span className="value">{candidateData.phone}</span>
            </div>
            <div className="info-row">
              <span className="label">Position Applied:</span>
              <span className="value">{candidateData.role}</span>
            </div>
            <div className="info-row">
              <span className="label">Application Status:</span>
              <span className={`status-badge status-${candidateData.hiring_status?.toLowerCase().replace(' ', '-')}`}>
                {candidateData.hiring_status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Offers Section */}
      {offers.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="card-header">My Offers</div>
          <div className="offers-list">
            {offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-header">
                  <h3>Offer Letter - {offer.hiring_type}</h3>
                  <span className={`status-badge status-${offer.acceptance_status?.toLowerCase()}`}>
                    {offer.acceptance_status}
                  </span>
                </div>
                <div className="offer-details">
                  <p>
                    <strong>Generated:</strong> {new Date(offer.generated_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Joining Date:</strong> {offer.joining_date || 'To be confirmed'}
                  </p>
                  <p>
                    <strong>Reporting Manager:</strong> {offer.reporting_manager || 'To be assigned'}
                  </p>
                </div>
                {offer.acceptance_status === 'Pending' && (
                  <div className="offer-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleAcceptOffer(offer.id)}
                    >
                      ✓ Accept Offer
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeclineOffer(offer.id)}
                    >
                      ✗ Decline Offer
                    </button>
                  </div>
                )}
                <button className="btn btn-secondary" style={{ marginTop: '10px' }}>
                  📄 View PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies Section */}
      {policies.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="card-header">Company Policies</div>
          <div className="policies-list">
            {policies.map((policy) => (
              <div key={policy.id} className="policy-item">
                <div className="policy-header">
                  <h4>{policy.title}</h4>
                  <span className="policy-category">{policy.category}</span>
                </div>
                <p className="policy-description">{policy.description}</p>
                {!acknowledgedPolicies.includes(policy.id) && (
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => handleAcknowledgePolicy(policy.id)}
                  >
                    ✓ Acknowledge
                  </button>
                )}
                {acknowledgedPolicies.includes(policy.id) && (
                  <span className="acknowledged-badge">✓ Acknowledged</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Communications Section */}
      {communications.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="card-header">Messages & Notifications</div>
          <div className="communications-list">
            {communications.map((comm) => (
              <div key={comm.id} className="communication-item">
                <div className="comm-header">
                  <h4>{comm.subject}</h4>
                  <span className={`comm-type ${comm.type?.toLowerCase()}`}>
                    {comm.type}
                  </span>
                </div>
                <p className="comm-date">
                  {new Date(comm.sent_at).toLocaleString()}
                </p>
                <p className="comm-message">{comm.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {offers.length === 0 && policies.length === 0 && communications.length === 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No offers, policies, or messages at this time.
          </p>
        </div>
      )}
    </div>
  );
}

export default CandidatePortal;
