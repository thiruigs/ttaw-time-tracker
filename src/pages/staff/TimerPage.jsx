import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  getDoc,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function TimerPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedTask, setSelectedTask] = useState('');

  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchTasks();
    fetchLogs();
  }, []);

  const fetchProjects = async () => {
    const snap = await getDocs(query(collection(db, 'projects'), where('recordStatus', '==', 'active')));
    setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchClients = async () => {
    const snap = await getDocs(query(collection(db, 'clients'), where('recordStatus', '==', 'active')));
    setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchTasks = async () => {
    const snap = await getDocs(query(collection(db, 'tasks'), where('recordStatus', '==', 'active')));
    setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchLogs = async () => {
    const userId = localStorage.getItem('userId');
    const q = query(
      collection(db, 'timeLogs'),
      where('userId', '==', userId),
      orderBy('startTime', 'desc')
    );

    const snapshot = await getDocs(q);
    const logData = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const [clientDoc, projectDoc, taskDoc] = await Promise.all([
        getDoc(doc(db, 'clients', data.clientId)),
        getDoc(doc(db, 'projects', data.projectId)),
        getDoc(doc(db, 'tasks', data.taskId)),
      ]);

      logData.push({
        id: docSnap.id,
        client: clientDoc.exists() ? clientDoc.data().name : 'N/A',
        project: projectDoc.exists() ? projectDoc.data().name : 'N/A',
        task: taskDoc.exists() ? taskDoc.data().name : 'N/A',
        startTime: data.startTime?.toDate(),
        endTime: data.endTime?.toDate(),
        duration: data.duration,
      });
    }

    setLogs(logData);
  };

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    setDuration(0);
    setMessage(`⏱️ Timer started at: ${now.toLocaleTimeString()}`);

    const id = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const handleStop = async () => {
    clearInterval(intervalId);
    const endTime = new Date();
    const totalSeconds = duration;
    const userId = localStorage.getItem('userId');

    const payload = {
      userId,
      clientId: selectedClient,
      projectId: selectedProject,
      taskId: selectedTask,
      startTime: startTime,
      endTime: endTime,
      duration: totalSeconds,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'timeLogs'), payload);

    setMessage(`🛑 Timer stopped at: ${endTime.toLocaleTimeString()}`);
    setStartTime(null);
    setDuration(0);
    setIntervalId(null);
    setSelectedClient('');
    setSelectedProject('');
    setSelectedTask('');

    fetchLogs();
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleProjectChange = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    setSelectedProject(projectId);
    setSelectedClient(project?.clientId || '');
    setSelectedTask('');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h2>Timer</h2>

      {message && <p style={{ color: '#007bff' }}>{message}</p>}

      <label>Project:</label><br />
      <select value={selectedProject} onChange={(e) => handleProjectChange(e.target.value)}>
        <option value="">-- Select Project --</option>
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select><br /><br />

      <label>Client:</label><br />
      <input
        value={clients.find(c => c.id === selectedClient)?.name || ''}
        readOnly
        style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
      /><br />

      <label>Task:</label><br />
      <select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)}>
        <option value="">-- Select Task --</option>
        {tasks
          .filter(t => t.recordStatus === 'active')
          .map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
      </select><br /><br />

      <div style={{ marginTop: '1rem' }}>
        <h3>Timer: {formatTime(duration)}</h3>
        {startTime ? (
          <button onClick={handleStop} style={{ backgroundColor: 'crimson', color: '#fff', padding: '10px 20px' }}>
            Stop Timer
          </button>
        ) : (
          <button onClick={handleStart} style={{ backgroundColor: 'green', color: '#fff', padding: '10px 20px' }}>
            Start Timer
          </button>
        )}
      </div>

      <h3 style={{ marginTop: '3rem' }}>📋 Your Time Logs</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th>Client</th>
            <th>Project</th>
            <th>Task</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No logs yet</td></tr>
          ) : logs.map(log => (
            <tr key={log.id}>
              <td>{log.client}</td>
              <td>{log.project}</td>
              <td>{log.task}</td>
              <td>{log.startTime?.toLocaleTimeString()}</td>
              <td>{log.endTime?.toLocaleTimeString()}</td>
              <td>{formatDuration(log.duration)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
