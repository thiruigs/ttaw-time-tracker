// src/pages/StaffHome.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function StaffHome() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome to Staff Home</h2>
      <nav style={{ marginTop: '1rem' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}>
            <Link to="/staff-home" style={linkStyle}>🏠 Home</Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link to="/staff/timer" style={linkStyle}>⏱️ Timer</Link>
          </li>
          <li>
            <Link to="/staff/reports" style={linkStyle}>📊 Reports</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

const linkStyle = {
  display: 'inline-block',
  backgroundColor: '#007bff',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '5px',
  textDecoration: 'none'
};
