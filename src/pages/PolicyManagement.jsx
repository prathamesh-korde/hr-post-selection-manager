import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PolicyManagement({ user }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Leave',
    filePath: '',
  });

  const API_BASE = '';

  const categories = ['Leave', 'Code of Conduct', 'IT Security', 'POSH', 'Other'];

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/policies`);
      setPolicies(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/policies`, formData);
      fetchPolicies();
      setShowModal(false);
      setFormData({ title: '', category: 'Leave', filePath: '' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Policy Management</h1>
        <p className="page-subtitle">Upload and manage company policies</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span>Policies ({policies.length})</span>
          {user?.role === 'HR Manager' || user?.role === 'Super Admin' ? (
            <button className="btn btn-primary btn-small" onClick={() => setShowModal(true)}>
              ➕ Upload Policy
            </button>
          ) : null}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Version</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td>{policy.title}</td>
                  <td>{policy.category}</td>
                  <td>v{policy.version}</td>
                  <td>{new Date(policy.created_at).toLocaleDateString()}</td>
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
            <div className="modal-header">Upload Policy</div>
            <form onSubmit={handleAddPolicy}>
              <div className="form-group">
                <label>Policy Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>File Path</label>
                <input
                  type="text"
                  value={formData.filePath}
                  onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                  placeholder="Path to policy file"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PolicyManagement;
