import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Communications.css';

function Communications({ user }) {
  const [candidates, setCandidates] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    recipientType: 'candidate',
    candidateId: '',
    type: 'Email',
    subject: '',
    message: '',
    templateId: '',
  });
  const [templateData, setTemplateData] = useState({
    name: '',
    type: 'Email',
    subject: '',
    message: '',
  });

  const API_BASE = '';

  const emailTemplates = {
    offer: {
      subject: 'Offer Letter - {candidateName}',
      message: `Dear {candidateName},

We are pleased to extend an offer for the position of {position} at our organization.

Position: {position}
Joining Date: {joiningDate}
Reporting Manager: {reportingManager}

Please review the attached offer letter and confirm your acceptance.

Best regards,
HR Team`,
    },
    acceptance: {
      subject: 'Offer Acceptance Confirmation',
      message: `Dear {candidateName},

Thank you for accepting our offer. We are excited to have you join our team.

Please find attached the onboarding details and required documents.

Best regards,
HR Team`,
    },
    rejection: {
      subject: 'Offer Rejection Notification',
      message: `Dear {candidateName},

We acknowledge your decision to decline our offer.

We appreciate your time and interest in our organization. We wish you all the best in your future endeavors.

Best regards,
HR Team`,
    },
    induction: {
      subject: 'Induction Schedule - {candidateName}',
      message: `Dear {candidateName},

Your induction is scheduled for {inductionDate} at {inductionTime}.

Venue: {venue}
Agenda: {agenda}

Please confirm your attendance.

Best regards,
HR Team`,
    },
    policy: {
      subject: 'Company Policies - Acknowledgment Required',
      message: `Dear {candidateName},

Please review and acknowledge the following company policies:

{policyList}

You can acknowledge these policies through your candidate portal.

Best regards,
HR Team`,
    },
  };

  const smsTemplates = {
    offer: 'Hi {candidateName}, We are pleased to offer you the position of {position}. Please check your email for the offer letter.',
    induction: 'Hi {candidateName}, Your induction is scheduled for {inductionDate}. Please confirm your attendance.',
    reminder: 'Hi {candidateName}, This is a reminder about your {event} scheduled for {date}.',
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesRes, communicationsRes, templatesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/candidates`),
        axios.get(`${API_BASE}/api/communications`),
        axios.get(`${API_BASE}/api/communication-templates`),
      ]);
      setCandidates(candidatesRes.data);
      setCommunications(communicationsRes.data);
      setTemplates(templatesRes.data);
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

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setTemplateData({ ...templateData, [name]: value });
  };

  const handleLoadTemplate = (templateId) => {
    const template = templates.find((t) => t.id === parseInt(templateId));
    if (template) {
      setFormData({
        ...formData,
        subject: template.subject,
        message: template.message,
        templateId,
      });
    }
  };

  const handleSendCommunication = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (user?.role !== 'HR Manager' && user?.role !== 'Super Admin') {
      setError('You do not have permission to send communications');
      return;
    }

    if (!formData.candidateId || !formData.subject || !formData.message) {
      setError('Please fill all required fields');
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/communications`, {
        candidateId: formData.candidateId,
        type: formData.type,
        subject: formData.subject,
        message: formData.message,
        sentBy: user.id,
      });
      setSuccess(`${formData.type} sent successfully`);
      fetchData();
      setShowModal(false);
      setFormData({
        recipientType: 'candidate',
        candidateId: '',
        type: 'Email',
        subject: '',
        message: '',
        templateId: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error sending communication');
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!templateData.name || !templateData.subject || !templateData.message) {
      setError('Please fill all required fields');
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/communication-templates`, {
        ...templateData,
        createdBy: user.id,
      });
      setSuccess('Template saved successfully');
      fetchData();
      setShowTemplateModal(false);
      setTemplateData({
        name: '',
        type: 'Email',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving template');
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  const canSendCommunications = user?.role === 'HR Manager' || user?.role === 'Super Admin';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Communications</h1>
        <p className="page-subtitle">Send emails and SMS to candidates</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {canSendCommunications && (
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ✉️ Send Communication
          </button>
          <button className="btn btn-secondary" onClick={() => setShowTemplateModal(true)}>
            📋 Save Template
          </button>
        </div>
      )}

      {/* Communication History */}
      <div className="card">
        <div className="card-header">Communication History</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Sent By</th>
                <th>Sent At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {communications.map((comm) => {
                const candidate = candidates.find((c) => c.id === comm.candidate_id);
                return (
                  <tr key={comm.id}>
                    <td>{candidate?.name || 'Unknown'}</td>
                    <td>
                      <span className={`comm-type ${comm.type?.toLowerCase()}`}>
                        {comm.type}
                      </span>
                    </td>
                    <td>{comm.subject}</td>
                    <td>{comm.sent_by || 'System'}</td>
                    <td>{new Date(comm.sent_at).toLocaleString()}</td>
                    <td>
                      <span className="status-badge status-sent">Sent</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Templates */}
      {templates.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="card-header">Saved Templates</div>
          <div className="templates-grid">
            {templates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <h4>{template.name}</h4>
                  <span className={`comm-type ${template.type?.toLowerCase()}`}>
                    {template.type}
                  </span>
                </div>
                <p className="template-subject">
                  <strong>Subject:</strong> {template.subject}
                </p>
                <p className="template-preview">{template.message.substring(0, 100)}...</p>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => handleLoadTemplate(template.id)}
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Communication Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content modal-large">
            <div className="modal-header">Send Communication</div>
            <form onSubmit={handleSendCommunication}>
              <div className="form-row">
                <div className="form-group">
                  <label>Recipient</label>
                  <select
                    name="candidateId"
                    value={formData.candidateId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Candidate</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              {templates.length > 0 && (
                <div className="form-group">
                  <label>Load Template</label>
                  <select onChange={(e) => handleLoadTemplate(e.target.value)}>
                    <option value="">Select a template...</option>
                    {templates
                      .filter((t) => t.type === formData.type)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="8"
                  required
                />
              </div>

              <div className="template-variables">
                <p>
                  <strong>Available Variables:</strong> {'{candidateName}'}, {'{position}'},{' '}
                  {'{joiningDate}'}, {'{reportingManager}'}, {'{inductionDate}'}, {'{venue}'}
                </p>
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
                  Send {formData.type}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showTemplateModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">Save Communication Template</div>
            <form onSubmit={handleSaveTemplate}>
              <div className="form-group">
                <label>Template Name</label>
                <input
                  type="text"
                  name="name"
                  value={templateData.name}
                  onChange={handleTemplateChange}
                  placeholder="e.g., Offer Letter Template"
                  required
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select name="type" value={templateData.type} onChange={handleTemplateChange}>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={templateData.subject}
                  onChange={handleTemplateChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={templateData.message}
                  onChange={handleTemplateChange}
                  rows="8"
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTemplateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Communications;
