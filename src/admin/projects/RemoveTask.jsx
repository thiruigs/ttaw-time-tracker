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

export default function RemoveTask() {
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

  const toggleRemoveTask = (taskId) => {
    setAssignedTasks(prev => prev.filter(id => id !== taskId));
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
      setSuccess('Tasks updated successfully.');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error updating project.');
      setSuccess('');
    }
  };

  const assignedTaskDetails = tasks.filter(t => assignedTasks.includes(t.id));

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Remove Tasks from Project</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <label>Select Project:</label><br />
      <select value={selectedProjectId} onChange={handleProjectChange}>
        <option value="">-- Select Project --</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select><br /><br />

      {selectedProjectId && assignedTaskDetails.length > 0 ? (
        <>
          <label>Assigned Tasks (uncheck to remove):</label>
          <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
            {assignedTaskDetails.map(task => (
              <div key={task.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleRemoveTask(task.id)}
                  />
                  {task.name}
                </label>
              </div>
            ))}
          </div><br />
          <button
            onClick={saveChanges}
            style={{ backgroundColor: '#f44336', color: 'white', padding: '10px 20px' }}
          >
            Save Changes
          </button>
        </>
      ) : selectedProjectId ? (
        <p>No tasks currently assigned to this project.</p>
      ) : null}
    </div>
  );
}
