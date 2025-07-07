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
  serverTimestamp,
} from 'firebase/firestore';

const StaffTypes = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [editId, setEditId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [error, setError] = useState('');

  const fetchRoles = async () => {
    const q = query(collection(db, 'staffTypes'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRoles(list);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const addRole = async () => {
    const name = newRole.trim();
    if (!name) return setError('Role name is required');
    const duplicate = roles.find(role => role.name.toLowerCase() === name.toLowerCase());
    if (duplicate) return setError('Role already exists');
    try {
      await addDoc(collection(db, 'staffTypes'), {
        name,
        recordStatus: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewRole('');
      setError('');
      fetchRoles();
    } catch (e) {
      console.error('Error adding role:', e);
    }
  };

  const startEdit = (id, name) => {
    setEditId(id);
    setEditRole(name);
  };

  const saveEdit = async () => {
    const name = editRole.trim();
    if (!name) return setError('Role name is required');
    const duplicate = roles.find(role => role.name.toLowerCase() === name.toLowerCase() && role.id !== editId);
    if (duplicate) return setError('Role already exists');
    try {
      await updateDoc(doc(db, 'staffTypes', editId), {
        name,
        updatedAt: serverTimestamp(),
      });
      setEditId(null);
      setEditRole('');
      setError('');
      fetchRoles();
    } catch (e) {
      console.error('Error editing role:', e);
    }
  };

  const deleteRole = async (id) => {
    if (!window.confirm('Delete this role?')) return;
    try {
      await updateDoc(doc(db, 'staffTypes', id), {
        recordStatus: 'deleted',
        updatedAt: serverTimestamp(),
      });
      fetchRoles();
    } catch (e) {
      console.error('Error deleting role:', e);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>👤 Staff Types</h2>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Enter role name (e.g., Admin)"
        value={newRole}
        onChange={(e) => setNewRole(e.target.value)}
      />
      <button onClick={addRole} style={{ marginLeft: '0.5rem' }}>➕ Add Role</button>

      <table border="1" cellPadding="8" style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.id}>
              <td>
                {editId === role.id ? (
                  <input value={editRole} onChange={(e) => setEditRole(e.target.value)} />
                ) : (
                  role.name
                )}
              </td>
              <td>
                {editId === role.id ? (
                  <>
                    <button onClick={saveEdit}>💾 Save</button>
                    <button onClick={() => setEditId(null)}>❌ Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(role.id, role.name)}>✏️ Edit</button>
                    <button onClick={() => deleteRole(role.id)} style={{ color: 'red' }}>🗑️ Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {roles.length === 0 && (
            <tr><td colSpan="2">No active roles.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTypes;
