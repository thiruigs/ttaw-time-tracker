import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  // Fetch all active teams
  const fetchTeams = async () => {
    const q = query(collection(db, 'teams'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    const teamList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTeams(teamList);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Add new team
  const createTeam = async () => {
    const name = newTeamName.trim();
    if (!name) {
      setError('Team name is required');
      setShowError(true);
      return;
    }

    const existing = teams.find(team => team.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setError('Team name already exists');
      setShowError(true);
      return;
    }

    try {
      await addDoc(collection(db, 'teams'), {
        name,
        recordStatus: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewTeamName('');
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  // Soft delete
  const softDeleteTeam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await updateDoc(doc(db, 'teams', id), {
        recordStatus: 'deleted',
        updatedAt: serverTimestamp()
      });
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  // Edit
  const startEdit = (id, name) => {
    setEditId(id);
    setEditName(name);
  };

  const saveEdit = async () => {
    const name = editName.trim();
    if (!name) {
      setError('Team name is required');
      setShowError(true);
      return;
    }

    const duplicate = teams.find(team =>
      team.name.toLowerCase() === name.toLowerCase() && team.id !== editId
    );
    if (duplicate) {
      setError('Team name already exists');
      setShowError(true);
      return;
    }

    try {
      await updateDoc(doc(db, 'teams', editId), {
        name,
        updatedAt: serverTimestamp()
      });
      setEditId(null);
      setEditName('');
      fetchTeams();
    } catch (error) {
      console.error('Error editing team:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>👥 Teams</h2>

      {showError && (
        <div style={{ background: '#ffe5e5', padding: '1rem', border: '1px solid red', marginBottom: '1rem' }}>
          <strong>{error}</strong><br />
          <button onClick={() => setShowError(false)} style={{ marginTop: '0.5rem' }}>OK</button>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter team name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
        />
        <button onClick={createTeam} style={{ marginLeft: '0.5rem' }}>➕ Add Team</button>
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id}>
              <td>
                {editId === team.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  team.name
                )}
              </td>
              <td>
                {editId === team.id ? (
                  <>
                    <button onClick={saveEdit}>💾 Save</button>
                    <button onClick={() => setEditId(null)}>❌ Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(team.id, team.name)}>✏️ Edit</button>
                    <button onClick={() => softDeleteTeam(team.id)} style={{ color: 'red' }}>🗑️ Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {teams.length === 0 && (
            <tr>
              <td colSpan="2">No active teams found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Teams;
