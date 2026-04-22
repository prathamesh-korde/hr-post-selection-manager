import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SalaryStructure.css';

function SalaryStructure({ user }) {
  const [candidates, setCandidates] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    candidateId: '',
    basic: 0,
    hra: 0,
    da: 0,
    specialAllowance: 0,
    pf: 0,
    esi: 0,
    tds: 0,
    professionalTax: 0,
  });

  const API_BASE = '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesRes, salariesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/candidates`),
        axios.get(`${API_BASE}/api/salary-structures`),
      ]);
      setCandidates(candidatesRes.data);
      setSalaries(salariesRes.data);
    } catch (error) {
      setError('Error fetching data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (user?.role !== 'HR Manager' && user?.role !== 'Super Admin') {
      setError('You do not have permission to define salary structures');
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/salary-structures`, formData);
      setSuccess('Salary structure created successfully');
      fetchData();
      setShowModal(false);
      setFormData({
        candidateId: '',
        basic: 0,
        hra: 0,
        da: 0,
        specialAllowance: 0,
        pf: 0,
        esi: 0,
        tds: 0,
        professionalTax: 0,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating salary structure');
    }
  };

  const calculateGross = () => {
    return formData.basic + formData.hra + formData.da + formData.specialAllowance;
  };

  const calculateDeductions = () => {
    return formData.pf + formData.esi + formData.tds + formData.professionalTax;
  };

  const calculateNet = () => {
    return calculateGross() - calculateDeductions();
  };

  const calculateAnnualCTC = () => {
    return calculateGross() * 12;
  };

  const getEligibleCandidates = () => {
    return candidates.filter((c) => c.hiring_status === 'Selected');
  };

  if (loading) return <div className="page-container">Loading...</div>;

  const eligibleCandidates = getEligibleCandidates();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Salary Structure</h1>
        <p className="page-subtitle">Define and manage salary structures for selected candidates</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <span>Salary Structures ({salaries.length})</span>
          {(user?.role === 'HR Manager' || user?.role === 'Super Admin') && (
            <button className="btn btn-primary btn-small" onClick={() => setShowModal(true)}>
              ➕ Add Salary Structure
            </button>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Basic</th>
                <th>HRA</th>
                <th>DA</th>
                <th>Gross</th>
                <th>Deductions</th>
                <th>Net</th>
                <th>Annual CTC</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((salary) => {
                const candidate = candidates.find((c) => c.id === salary.candidate_id);
                const gross = salary.basic + salary.hra + salary.da + salary.special_allowance;
                const deductions = salary.pf + salary.esi + salary.tds + salary.professional_tax;
                const net = gross - deductions;
                const annualCTC = gross * 12;

                return (
                  <tr key={salary.id}>
                    <td>{candidate?.name || 'Unknown'}</td>
                    <td>₹{salary.basic.toLocaleString()}</td>
                    <td>₹{salary.hra.toLocaleString()}</td>
                    <td>₹{salary.da.toLocaleString()}</td>
                    <td className="highlight">₹{gross.toLocaleString()}</td>
                    <td>₹{deductions.toLocaleString()}</td>
                    <td className="highlight">₹{net.toLocaleString()}</td>
                    <td className="highlight">₹{annualCTC.toLocaleString()}</td>
                    <td>{new Date(salary.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Salary Structure Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content modal-large">
            <div className="modal-header">Add Salary Structure</div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
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
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Earnings</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Basic Salary</label>
                  <input
                    type="number"
                    name="basic"
                    value={formData.basic}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>HRA</label>
                  <input
                    type="number"
                    name="hra"
                    value={formData.hra}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>DA</label>
                  <input
                    type="number"
                    name="da"
                    value={formData.da}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Special Allowance</label>
                  <input
                    type="number"
                    name="specialAllowance"
                    value={formData.specialAllowance}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Deductions</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>PF</label>
                  <input
                    type="number"
                    name="pf"
                    value={formData.pf}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>ESI</label>
                  <input
                    type="number"
                    name="esi"
                    value={formData.esi}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>TDS</label>
                  <input
                    type="number"
                    name="tds"
                    value={formData.tds}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Professional Tax</label>
                  <input
                    type="number"
                    name="professionalTax"
                    value={formData.professionalTax}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="salary-summary">
                <div className="summary-row">
                  <span>Gross Salary:</span>
                  <span className="amount">₹{calculateGross().toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Total Deductions:</span>
                  <span className="amount">₹{calculateDeductions().toLocaleString()}</span>
                </div>
                <div className="summary-row highlight">
                  <span>Net Salary (Monthly):</span>
                  <span className="amount">₹{calculateNet().toLocaleString()}</span>
                </div>
                <div className="summary-row highlight">
                  <span>Annual CTC:</span>
                  <span className="amount">₹{calculateAnnualCTC().toLocaleString()}</span>
                </div>
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
                  Create Salary Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalaryStructure;
