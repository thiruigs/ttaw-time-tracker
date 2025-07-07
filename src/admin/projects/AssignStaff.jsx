import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function AssignStaff() {
  const [projects, setProjects] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchStaff();
  }, []);

  const fetchProjects = async () => {
    const q = query(collection(db, 'projects'), where('recordStatus', '==', 'active'));
    const snap = await getDocs(q);
    setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchStaff = async () => {
    const q = query(collection(db, 'staff'), where('recordStatus', '==', 'active'));
    const snap = await getDocs(q);
    setStaffList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAssign = async () => {
    if (!selectedProject || selectedStaff.length === 0) {
      setMsg('Please select project and staff.');
      return;
    }

    try {
      for (let staffId of selectedStaff) {
        await addDoc(collection(db, 'projectStaffs'), {
          projectId: selectedProject,
          staffId,
          assignedAt: serverTimestamp(),
        });
      }

      setMsg('Staff assigned successfully.');
      setSelectedStaff([]);
    } catch (err) {
      console.error(err);
      setMsg('Failed to assign staff.');
    }
  };

  const toggleStaff = (id) => {
    setSelectedStaff(prev =>
      prev.includes(id)
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>Assign Staff to Project</h2>
      {msg && <p>{msg}</p>}

      <label>Select Project:</label>
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        <option value="">-- Select Project --</option>
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <label>Select Staff:</label>
      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
        {staffList.map(s => (
          <div key={s.id}>
            <input
              type="checkbox"
              checked={selectedStaff.includes(s.id)}
              onChange={() => toggleStaff(s.id)}
            />
            {s.name || s.email} ({s.staffType || 'Staff'})
          </div>
        ))}
      </div>

      <button
        onClick={handleAssign}
        style={{
          marginTop: '1rem',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Assign Selected Staff
      </button>
    </div>
  );
}
