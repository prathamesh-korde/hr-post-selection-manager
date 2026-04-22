import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Reports({ user }) {
  const [hiringReport, setHiringReport] = useState([]);
  const [offerReport, setOfferReport] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = '';

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [hiring, offer] = await Promise.all([
        axios.get(`${API_BASE}/api/reports/hiring`),
        axios.get(`${API_BASE}/api/reports/offer-acceptance`),
      ]);
      setHiringReport(hiring.data);
      setOfferReport(offer.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">View hiring and performance analytics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">Hiring by Type</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {hiringReport.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.hiring_type || 'Not Specified'}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Offer Acceptance Status</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {offerReport.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.acceptance_status}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
