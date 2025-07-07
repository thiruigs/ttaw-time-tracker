// src/pages/Signin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import bcrypt from 'bcryptjs';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setMsg('');

    try {
      if (!email || !password) {
        return setMsg('Please enter both email and password.');
      }

      const q = query(collection(db, 'staff'), where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return setMsg('Invalid credentials.');
      }

      const doc = snapshot.docs[0];
      const user = doc.data();
      const userId = doc.id;

      if (user.recordStatus !== 'active') {
        return setMsg('Account is not activated.');
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return setMsg('Invalid credentials.');
      }

      // Store session
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('role', user.staffType || 'Staff');

      // Redirect based on role
      if ((user.staffType || '').toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/staff/timer');
      }
    } catch (err) {
      console.error('Login error:', err);
      setMsg('Login failed. Please try again.');
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '2rem auto',
      padding: '2rem',
      border: '1px solid #ccc',
      borderRadius: '8px',
    }}>
      <h2>Login</h2>

      {msg && <p style={{ color: 'red' }}>{msg}</p>}

      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />

      <label>Password:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        required
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />

      <button
        onClick={handleLogin}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Login
      </button>

      <p style={{ textAlign: 'right' }}>
      <a href="/forgot-password" style={{ color: '#007bff', textDecoration: 'underline' }}>
        Forgot password?
      </a>
    </p>


    </div>
  );
}
