// src/pages/ResetPassword.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import bcrypt from 'bcryptjs';

export default function ResetPassword() {
  const { userId, token } = useParams();
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const userRef = doc(db, 'staff', userId);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return;
      const data = snap.data();
      if (data.resetToken === token) setValid(true);
    };
    verify();
  }, [userId, token]);

  const handleReset = async () => {
    setMsg('');
    if (password !== confirm) return setMsg('Passwords do not match.');
    if (password.length < 8) return setMsg('Password must be at least 8 characters.');

    const hashed = await bcrypt.hash(password, 10);
    await updateDoc(doc(db, 'staff', userId), {
      password: hashed,
      resetToken: '',
    });

    setMsg('Password reset successful. Redirecting...');
    setTimeout(() => navigate('/signin'), 2000);
  };

  if (!valid) return <p style={{ padding: '2rem', color: 'red' }}>Invalid or expired link.</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Reset Password</h2>
      {msg && <p style={{ color: msg.includes('successful') ? 'green' : 'red' }}>{msg}</p>}
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}
      />
      <button
        onClick={handleReset}
        style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white' }}
      >
        Reset Password
      </button>
    </div>
  );
}
