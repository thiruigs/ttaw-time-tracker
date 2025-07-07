// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css'; // style we'll define

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="glass-card">
        <h1>Welcome to Time Tracker</h1>
        <button className="signup-btn" onClick={() => navigate('/signup')}>Signup</button>
        <button className="signin-btn" onClick={() => navigate('/signin')}>Signin</button>
      </div>
    </div>
  );
}
