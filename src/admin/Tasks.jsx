import React, { useEffect, useState } from 'react';
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
import { db } from '../firebaseConfig';

export default function Tasks() {
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('Work');
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const q = query(collection(db, 'tasks'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(data);
  };

  const resetForm = () => {
    setTaskName('');
    setTaskType('Work');
    setEditId(null);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    if (!taskName.trim()) {
      return setError('Task name is required.');
    }

    const q = query(collection(db, 'tasks'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    const existing = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .find(t => t.name.toLowerCase() === taskName.toLowerCase() && t.id !== editId);

    if (existing) {
      return setError('Task name already exists.');
    }

    const payload = {
      name: taskName.trim(),
      type: taskType,
      recordStatus: 'active',
      updatedAt: serverTimestamp(),
    };

    try {
      if (editId) {
        await updateDoc(doc(db, 'tasks', editId), payload);
      } else {
        await addDoc(collection(db, 'tasks'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  const handleEdit = (task) => {
    setTaskName(task.name);
    setTaskType(task.type);
    setEditId(task.id);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await updateDoc(doc(db, 'tasks', id), {
        recordStatus: 'inactive',
        updatedAt: serverTimestamp(),
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to delete task.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>Manage Tasks</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>Task Name:</label>
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Enter task name"
        style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
      />

      <label>Task Type:</label>
      <select
        value={taskType}
        onChange={(e) => setTaskType(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
      >
        <option value="Work">Work</option>
        <option value="Break">Break</option>
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {editId ? 'Update Task' : 'Add Task'}
        </button>

        {(taskName || editId || error) && (
          <button
            onClick={resetForm}
            style={{
              background: 'none',
              color: '#007bff',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Reset
          </button>
        )}
      </div>

      <h3 style={{ marginTop: '2rem' }}>Active Tasks</h3>
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr
              key={task.id}
              style={{
                backgroundColor: task.type === 'Break' ? '#ffe6e6' : 'transparent',
              }}
            >
              <td>{task.name}</td>
              <td>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    backgroundColor: task.type === 'Break' ? '#dc3545' : '#007bff',
                  }}
                >
                  {task.type === 'Break' ? '☕ Break' : '🛠 Work'}
                </span>
              </td>

              <td>
                <button onClick={() => handleEdit(task)}>Edit</button>
                <button
                  onClick={() => handleDelete(task.id)}
                  style={{ marginLeft: '1rem', color: 'red' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>No tasks found.</td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  );
}
