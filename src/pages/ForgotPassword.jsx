// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setMsg('');
    setError('');

    if (!email) return setError('Email is required.');

    const q = query(collection(db, 'staff'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return setError('No user found with this email.');

    const docRef = snapshot.docs[0].ref;
    const resetToken = uuidv4();

    await updateDoc(docRef, { resetToken });

    setMsg(`Reset link: ${window.location.origin}/reset-password/${snapshot.docs[0].id}/${resetToken}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Forgot Password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {msg && <p style={{ color: 'green', wordBreak: 'break-word' }}>{msg}</p>}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}
      />
      <button
        onClick={handleSubmit}
        style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white' }}
      >
        Send Reset Link
      </button>
    </div>
  );
}
