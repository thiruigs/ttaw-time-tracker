// src/pages/utils/FixProjectTasks.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // adjust path if needed

export default function FixProjectTasks() {
  const [status, setStatus] = useState('⏳ Updating...');

  useEffect(() => {
    const fixMissingRecordStatus = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'projectTasks'));

        const updates = snapshot.docs
          .filter(doc => !doc.data().recordStatus)
          .map(docSnap => {
            const ref = doc(db, 'projectTasks', docSnap.id);
            return updateDoc(ref, { recordStatus: 'active' });
          });

        await Promise.all(updates);
        setStatus('✅ Updated all missing `recordStatus` to "active"');
      } catch (err) {
        console.error('🔥 Error updating projectTasks:', err);
        setStatus('❌ Failed to update some documents');
      }
    };

    fixMissingRecordStatus();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Fix Project Tasks</h2>
      <p>{status}</p>
    </div>
  );
}
