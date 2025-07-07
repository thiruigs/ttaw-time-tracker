// src/pages/utils/FixProjectStaffs.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function FixProjectStaffs() {
  const [status, setStatus] = useState('⏳ Updating projectStaffs...');

  useEffect(() => {
    const fixProjectStaffs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'projectStaffs'));

        const updates = snapshot.docs
          .filter(doc => !doc.data().recordStatus)
          .map(docSnap => {
            const ref = doc(db, 'projectStaffs', docSnap.id);
            return updateDoc(ref, { recordStatus: 'active' });
          });

        await Promise.all(updates);
        setStatus('✅ Updated all missing `recordStatus` in projectStaffs to "active".');
      } catch (err) {
        console.error('🔥 Error updating projectStaffs:', err);
        setStatus('❌ Failed to update projectStaffs.');
      }
    };

    fixProjectStaffs();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Fix Project Staffs</h2>
      <p>{status}</p>
    </div>
  );
}
