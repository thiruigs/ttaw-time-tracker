import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function AssignTask() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  const fetchProjects = async () => {
    const q = query(collection(db, 'projects'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchTasks = async () => {
    const q = query(collection(db, 'tasks'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleProjectChange = (e) => {
    const pid = e.target.value;
    setSelectedProjectId(pid);
    const project = projects.find(p => p.id === pid);
    setAssignedTasks(project?.assignedTasks || []);
  };

  const toggleTask = (taskId) => {
    setAssignedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const saveChanges = async () => {
    if (!selectedProjectId) {
      setError('Please select a project.');
      return;
    }

    try {
      await updateDoc(doc(db, 'projects', selectedProjectId), {
        assignedTasks,
        updatedAt: new Date()
      });
      setSuccess('Tasks assigned successfully.');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error updating project.');
      setSuccess('');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Assign Tasks to Project</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <label>Select Project:</label><br />
      <select value={selectedProjectId} onChange={handleProjectChange}>
        <option value="">-- Select Project --</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select><br /><br />

      {selectedProjectId && (
        <>
          <label>Select Tasks:</label>
          <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
            {tasks.map(task => (
              <div key={task.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={assignedTasks.includes(task.id)}
                    onChange={() => toggleTask(task.id)}
                  />
                  {task.name}
                </label>
              </div>
            ))}
          </div><br />
          <button onClick={saveChanges} style={{ backgroundColor: '#4caf50', color: 'white', padding: '10px 20px' }}>
            Save Assignment
          </button>
        </>
      )}
    </div>
  );
}
