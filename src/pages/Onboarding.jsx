import React, { useState } from 'react';

function Onboarding({ user }) {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Onboarding Management</h1>
        <p className="page-subtitle">Manage employee onboarding checklists</p>
      </div>

      <div className="card">
        <div className="card-header">Onboarding Checklist</div>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Track document collection, system account creation, and asset assignment for new hires.
        </p>
        <button className="btn btn-primary">Create Onboarding Task</button>
      </div>
    </div>
  );
}

export default Onboarding;
