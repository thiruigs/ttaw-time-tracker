import React, { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Projects() {
  const [projectName, setProjectName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [assignmentType, setAssignmentType] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
    fetchStaff();
    fetchTeams();
  }, []);

  const fetchClients = async () => {
    const snapshot = await getDocs(query(collection(db, 'clients'), where('recordStatus', '==', 'active')));
    setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchStaff = async () => {
    const snapshot = await getDocs(query(collection(db, 'staff'), where('recordStatus', '==', 'active')));
    setStaffList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchTeams = async () => {
    const snapshot = await getDocs(query(collection(db, 'teams'), where('recordStatus', '==', 'active')));
    setTeamList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const saveProject = async () => {
    setError('');
    if (!projectName) return setError('Project Name is required.');

    let assignedStaff = [];
    if (assignmentType === 'All') {
      assignedStaff = staffList.map(s => s.id);
    } else if (assignmentType === 'Team') {
      assignedStaff = staffList.filter(s => s.teamId === selectedTeam).map(s => s.id);
    } else if (assignmentType === 'Staff') {
      assignedStaff = selectedStaff;
    }

    const payload = {
      name: projectName,
      clientId: clientId || 'none',
      assignedStaff,
      recordStatus: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'projects'), payload);
      setProjectName('');
      setClientId('');
      setAssignmentType('All');
      setSelectedTeam('');
      setSelectedStaff([]);
      alert('Project saved successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to save project.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Project Setup</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>Project Name:</label><br />
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Enter project name"
      /><br /><br />

      <label>Client:</label><br />
      <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
        <option value="">-- No Client --</option>
        {clients.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select><br /><br />

      <label>Assign To:</label><br />
      <select
        value={assignmentType}
        onChange={(e) => {
          setAssignmentType(e.target.value);
          setSelectedStaff([]);
          setSelectedTeam('');
        }}
      >
        <option value="All">All Teams</option>
        <option value="Team">Specific Team</option>
        <option value="Staff">Specific Staff</option>
      </select><br /><br />

      {assignmentType === 'Team' && (
        <>
          <label>Select Team:</label><br />
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">-- Select Team --</option>
            {teamList.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select><br /><br />
        </>
      )}

      {assignmentType === 'Staff' && (
        <>
          <label>Select Staff:</label><br />
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '0.5rem' }}>
            {staffList.map(staff => (
              <div key={staff.id}>
                <label>
                  <input
                    type="checkbox"
                    value={staff.id}
                    checked={selectedStaff.includes(staff.id)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSelectedStaff(prev =>
                        isChecked ? [...prev, staff.id] : prev.filter(id => id !== staff.id)
                      );
                    }}
                  />
                  {staff.name} ({staff.email})
                </label>
              </div>
            ))}
          </div><br />
        </>
      )}

      <button onClick={saveProject} style={{ backgroundColor: '#4caf50', color: '#fff', padding: '10px 20px' }}>
        Save Project
      </button>
    </div>
  );
}
