import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function RemoveStaff() {
  const [projects, setProjects] = useState([]);
  const [staffList, setStaffList] = useState([]);
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
    setStaffList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
    const selected = projects.find(p => p.id === projectId);
    setAssignedStaff(selected?.assignedStaff || []);
  };

  const toggleRemoveStaff = (id) => {
    setAssignedStaff(prev => prev.filter(staffId => staffId !== id));
  };

  const saveChanges = async () => {
    setError('');
    setSuccess('');
    if (!selectedProjectId) return setError('Please select a project.');

    try {
      await updateDoc(doc(db, 'projects', selectedProjectId), {
        assignedStaff,
        updatedAt: new Date(),
      });
      setSuccess('Staff removed successfully.');
    } catch (err) {
      console.error(err);
      setError('Error updating project.');
    }
  };

  const assignedStaffDetails = staffList.filter(s => assignedStaff.includes(s.id));

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Remove Staff from Project</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <label>Select Project:</label><br />
      <select value={selectedProjectId} onChange={handleProjectChange}>
        <option value="">-- Select Project --</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select><br /><br />

      {selectedProjectId && assignedStaffDetails.length > 0 ? (
        <>
          <label>Assigned Staff (uncheck to remove):</label>
          <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
            {assignedStaffDetails.map(staff => (
              <div key={staff.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleRemoveStaff(staff.id)}
                  />
                  {staff.name} ({staff.email})
                </label>
              </div>
            ))}
          </div><br />
          <button
            onClick={saveChanges}
            style={{ backgroundColor: '#f44336', color: '#fff', padding: '10px 20px' }}
          >
            Save Changes
          </button>
        </>
      ) : selectedProjectId ? (
        <p>No staff currently assigned to this project.</p>
      ) : null}
    </div>
  );
}
