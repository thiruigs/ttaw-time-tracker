import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function AssignTask() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [assignedList, setAssignedList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchAssignedTasks();
  }, []);

  const fetchProjects = async () => {
    const q = query(collection(db, 'projects'), where('recordStatus', '==', 'active'));
    const snap = await getDocs(q);
    setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchTasks = async () => {
    const q = query(collection(db, 'tasks'), where('recordStatus', '==', 'active'));
    const snap = await getDocs(q);
    setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchAssignedTasks = async () => {
    const q = query(collection(db, 'projectTasks'), where('recordStatus', '==', 'active'));
    const snap = await getDocs(q);

    const enriched = await Promise.all(
      snap.docs.map(async d => {
        const data = d.data();
        const taskSnap = await getDoc(doc(db, 'tasks', data.taskId));
        const projectSnap = await getDoc(doc(db, 'projects', data.projectId));
        return {
          id: d.id,
          taskName: taskSnap.exists() ? taskSnap.data().name : 'Unknown',
          projectName: projectSnap.exists() ? projectSnap.data().name : 'Unknown',
        };
      })
    );

    setAssignedList(enriched);
  };

  const handleAssign = async () => {
    setError('');

    if (!selectedProject || !selectedTask) {
      return setError('Please select both project and task.');
    }

    try {
      // Check for duplicate
      const q = query(
        collection(db, 'projectTasks'),
        where('projectId', '==', selectedProject),
        where('taskId', '==', selectedTask),
        where('recordStatus', '==', 'active')
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        return setError('Task already assigned to this project.');
      }

      await addDoc(collection(db, 'projectTasks'), {
        projectId: selectedProject,
        taskId: selectedTask,
        recordStatus: 'active',
        createdAt: serverTimestamp(),
      });

      setSelectedTask('');
      fetchAssignedTasks();
      alert('Task assigned to project.');
    } catch (err) {
      console.error('Error assigning task:', err);
      alert('Something went wrong.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to unassign this task?')) return;

    try {
      await updateDoc(doc(db, 'projectTasks', id), {
        recordStatus: 'inactive',
        updatedAt: serverTimestamp(),
      });
      fetchAssignedTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to delete.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
      <h2>Assign Task to Project</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>Project:</label>
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
      >
        <option value="">-- Select Project --</option>
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <label>Task:</label>
      <select
        value={selectedTask}
        onChange={(e) => setSelectedTask(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
      >
        <option value="">-- Select Task --</option>
        {tasks.map(t => (
          <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
        ))}
      </select>

      <button
        onClick={handleAssign}
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Assign Task
      </button>

      <h3 style={{ marginTop: '2rem' }}>Assigned Tasks</h3>
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th>Project</th>
            <th>Task</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignedList.map(item => (
            <tr key={item.id}>
              <td>{item.projectName}</td>
              <td>{item.taskName}</td>
              <td>
                <button onClick={() => handleDelete(item.id)} style={{ color: 'red' }}>
                  Unassign
                </button>
              </td>
            </tr>
          ))}
          {assignedList.length === 0 && (
            <tr><td colSpan="3" style={{ textAlign: 'center' }}>No tasks assigned.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
