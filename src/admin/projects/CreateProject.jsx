import React, { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function CreateProject() {
  const [projectName, setProjectName] = useState('');
  const [clientId, setClientId] = useState('');
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, []);

  const fetchClients = async () => {
    const q = query(collection(db, 'clients'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchProjects = async () => {
    const q = query(collection(db, 'projects'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const saveProject = async () => {
    setError('');
    if (!projectName) return setError('Project name is required.');

    const payload = {
      name: projectName,
      clientId: clientId || 'none',
      recordStatus: 'active',
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'projects', editingId), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'projects'), payload);
      }

      setProjectName('');
      setClientId('');
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
      setError('Failed to save project.');
    }
  };

  const editProject = (p) => {
    setProjectName(p.name);
    setClientId(p.clientId === 'none' ? '' : p.clientId);
    setEditingId(p.id);
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure to delete this project?')) return;
    await updateDoc(doc(db, 'projects', id), {
      recordStatus: 'deleted',
      updatedAt: serverTimestamp(),
    });
    fetchProjects();
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Create Project</h2>
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

      <button onClick={saveProject} style={{
        backgroundColor: editingId ? '#ffa500' : '#4caf50',
        color: '#fff',
        padding: '8px 20px',
        border: 'none',
        borderRadius: '4px'
      }}>
        {editingId ? 'Update' : 'Save'} Project
      </button>

      <hr />
      <h3>Project List</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Client</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{clients.find(c => c.id === p.clientId)?.name || 'None'}</td>
              <td>
                <button onClick={() => editProject(p)}>✏️</button>
                <button onClick={() => deleteProject(p.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
