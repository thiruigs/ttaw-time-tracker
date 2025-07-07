import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function StaffLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/signin');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav
        style={{
          width: '220px',
          backgroundColor: '#f0f0f0',
          padding: '1rem',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
        }}
      >
        <h2>Staff Panel</h2>
        <ul style={{ listStyle: 'none', paddingLeft: 0, lineHeight: '2.2' }}>
          {/* <li><Link to="/staff/home">🏠 Home</Link></li> */}
          <li><Link to="/staff/timer">⏱️ Timer</Link></li>
          {/* <li><Link to="/staff/reports">📊 Reports</Link></li> */}
        </ul>
      </nav>

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        {/* Top bar with logout */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '1rem',
          borderBottom: '1px solid #ddd'
        }}>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#8B0000', // dark red
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔒 Logout
          </button>
        </div>

        {/* Page content */}
        <div style={{ padding: '2rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
