import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ActivateAccount() {
  const { id, token } = useParams(); // Grab userId and activationCode from URL
  const [status, setStatus] = useState('Activating...');
  const navigate = useNavigate();

  useEffect(() => {
    const activate = async () => {
      try {
        if (!id || !token) {
          setStatus('Invalid activation link.');
          return;
        }

        const docRef = doc(db, 'staff', id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          setStatus('Invalid or expired activation link.');
          return;
        }

        const user = snapshot.data();
        if (user.recordStatus === 'active') {
          setStatus('Account is already activated. Redirecting to login...');
          setTimeout(() => navigate('/signin'), 3000);
          return;
        }

        if (user.activationCode !== token) {
          setStatus('Invalid or expired activation link.');
          return;
        }

        await updateDoc(docRef, {
          recordStatus: 'active',
          activationCode: null,
        });

        setStatus('Account activated successfully! Redirecting to login...');
        setTimeout(() => navigate('/signin'), 3000);
      } catch (err) {
        console.error('Activation error:', err);
        setStatus('Something went wrong during activation.');
      }
    };

    activate();
  }, [id, token, navigate]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{status}</h2>
    </div>
  );
}
