// src/pages/Activate.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Activate() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const activateAccount = async () => {
      const id = params.get('id');
      if (!id) {
        setMessage('Invalid activation link.');
        return;
      }

      const ref = doc(db, 'staff', id);
      const snapshot = await getDoc(ref);

      if (!snapshot.exists()) {
        setMessage('Activation failed. User not found.');
        return;
      }

      await updateDoc(ref, {
        status: 'active',
        updatedAt: new Date(),
      });

      setMessage('Account activated! Redirecting to login...');
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    };

    activateAccount();
  }, [params, navigate]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Account Activation</h2>
      <p>{message}</p>
    </div>
  );
}
