import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activationLink, setActivationLink] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password);

  const handleSignup = async () => {
    setError('');
    setSuccess('');
    setActivationLink('');

    if (!validateEmail(email)) {
      return setError('Invalid email format.');
    }

    if (!validateStrongPassword(password)) {
      return setError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    // Check for existing email
    const q = query(collection(db, 'staff'), where('email', '==', email));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return setError('Email already exists.');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const activationCode = uuidv4();

      const docRef = await addDoc(collection(db, 'staff'), {
        email,
        password: hashedPassword,
        recordStatus: 'inactive',
        staffType: 'Admin', // 👈 Automatically assigning Admin role
        activationCode,
        createdAt: serverTimestamp(),
      });

      const link = `${window.location.origin}/activate/${docRef.id}/${activationCode}`;
      setSuccess('Signup successful. Please activate your account using the activation link below.');
      setActivationLink(link);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Signup</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {activationLink && (
        <p style={{ wordBreak: 'break-word' }}>
          <strong>Activation Link:</strong><br />
          <a href={activationLink}>{activationLink}</a>
        </p>
      )}

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

      <label>Confirm Password:</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Re-enter password"
        required
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />

      <button
        onClick={handleSignup}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Signup
      </button>
    </div>
  );
}
