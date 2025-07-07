import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function AssignStaff() {
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchStaff();
  }, []);

  const fetchProjects = async () => {
    const q = query(collection(db, 'projects'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchStaff = async () => {
    const q = query(collection(db, 'staff'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
    setAssignedStaff([]);

    const project = projects.find(p => p.id === projectId);
    if (project) {
      setAssignedStaff(project.assignedStaff || []);
    }
  };

  const toggleStaff = (staffId) => {
    setAssignedStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const saveAssignment = async () => {
    setError('');
    setSuccess('');

    if (!selectedProjectId) return setError('Please select a project.');

    try {
      await updateDoc(doc(db, 'projects', selectedProjectId), {
        assignedStaff,
        updatedAt: new Date(),
      });
      setSuccess('Staff assigned successfully.');
    } catch (err) {
      console.error(err);
      setError('Error saving assignment.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Assign Staff to Project</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <label>Select Project:</label><br />
      <select value={selectedProjectId} onChange={handleProjectChange}>
        <option value="">-- Select Project --</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select><br /><br />

      {selectedProjectId && (
        <>
          <label>Select Staff to Assign:</label>
          <div style={{
            border: '1px solid #ccc',
            maxHeight: '250px',
            overflowY: 'auto',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            {staff.map(s => (
              <div key={s.id}>
                <label>
                  <input
                    type="checkbox"
                    value={s.id}
                    checked={assignedStaff.includes(s.id)}
                    onChange={() => toggleStaff(s.id)}
                  />
                  {s.name} ({s.email})
                </label>
              </div>
            ))}
          </div>
          <button onClick={saveAssignment} style={{ backgroundColor: '#4caf50', color: '#fff', padding: '10px 20px' }}>
            Save Assignment
          </button>
        </>
      )}
    </div>
  );
}
