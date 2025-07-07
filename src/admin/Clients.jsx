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

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [newClientName, setNewClientName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  // Fetch active clients
  const fetchClients = async () => {
    const q = query(collection(db, 'clients'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    const clientList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClients(clientList);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Add client
  const createClient = async () => {
    const name = newClientName.trim();
    if (!name) {
      setError('Client name is required');
      setShowError(true);
      return;
    }

    const existing = clients.find(client => client.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setError('Client name already exists');
      setShowError(true);
      return;
    }

    try {
      await addDoc(collection(db, 'clients'), {
        name,
        recordStatus: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewClientName('');
      fetchClients();
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  // Soft delete
  const softDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await updateDoc(doc(db, 'clients', id), {
        recordStatus: 'deleted',
        updatedAt: serverTimestamp()
      });
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
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
      setError('Client name is required');
      setShowError(true);
      return;
    }

    const duplicate = clients.find(client =>
      client.name.toLowerCase() === name.toLowerCase() && client.id !== editId
    );
    if (duplicate) {
      setError('Client name already exists');
      setShowError(true);
      return;
    }

    try {
      await updateDoc(doc(db, 'clients', editId), {
        name,
        updatedAt: serverTimestamp()
      });
      setEditId(null);
      setEditName('');
      fetchClients();
    } catch (error) {
      console.error('Error editing client:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🏢 Clients</h2>

      {showError && (
        <div style={{ background: '#ffe5e5', padding: '1rem', border: '1px solid red', marginBottom: '1rem' }}>
          <strong>{error}</strong><br />
          <button onClick={() => setShowError(false)} style={{ marginTop: '0.5rem' }}>OK</button>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter client name"
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
        />
        <button onClick={createClient} style={{ marginLeft: '0.5rem' }}>➕ Add Client</button>
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>
                {editId === client.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  client.name
                )}
              </td>
              <td>
                {editId === client.id ? (
                  <>
                    <button onClick={saveEdit}>💾 Save</button>
                    <button onClick={() => setEditId(null)}>❌ Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(client.id, client.name)}>✏️ Edit</button>
                    <button onClick={() => softDeleteClient(client.id)} style={{ color: 'red' }}>🗑️ Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan="2">No active clients found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Clients;
