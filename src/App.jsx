import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);

  const adminEmails = ['thiru@example.com']; // 👈 replace with your email

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadLogs(currentUser.uid);
        if (adminEmails.includes(currentUser.email)) {
          loadAllLogs();
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = () => {
    signOut(auth);
  };

  const startTimer = () => {
    const now = new Date();
    setStartTime(now);
    setEndTime(null);
    setElapsedTime(0);
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    const end = new Date();
    setEndTime(end);

    if (user && startTime) {
      try {
        await addDoc(collection(db, 'timeLogs'), {
          uid: user.uid,
          email: user.email,
          start: startTime,
          end: end,
          createdAt: serverTimestamp(),
        });
        alert("Time logged to Firestore!");
        loadLogs(user.uid);
        if (adminEmails.includes(user.email)) {
          loadAllLogs();
        }
      } catch (e) {
        console.error("Error adding document: ", e);
        alert("Failed to log time.");
      }
    }

    setStartTime(null);
    setElapsedTime(0);
  };

  const loadLogs = async (uid) => {
    const q = query(
      collection(db, 'timeLogs'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => doc.data());
    setLogs(data);
  };

  const loadAllLogs = async () => {
    const q = query(
      collection(db, 'timeLogs'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => doc.data());
    setAllLogs(data);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🕒 Time Tracker</h1>

      {!user ? (
        <div>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /><br /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br /><br />
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {user.email}</h2>
          <button onClick={logout}>Logout</button>
          <br /><br />

          {startTime ? (
            <div>
              <p>⏱️ Timer started at: {startTime.toLocaleTimeString()}</p>
              <p>⏳ Timer running: {formatTime(elapsedTime)}</p>
              <button onClick={stopTimer}>Stop Timer</button>
            </div>
          ) : (
            <button onClick={startTimer}>Start Timer</button>
          )}

          {endTime && (
            <p>🛑 Timer stopped at: {endTime.toLocaleTimeString()}</p>
          )}

          {/* Personal Logs Table */}
          <h3 style={{ marginTop: '2rem' }}>📋 Your Time Logs</h3>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const start = new Date(log.start.seconds * 1000);
                const end = new Date(log.end.seconds * 1000);
                const durationMs = end - start;
                const minutes = Math.floor(durationMs / 60000);
                const seconds = Math.floor((durationMs % 60000) / 1000);

                return (
                  <tr key={index}>
                    <td>{start.toLocaleTimeString()}</td>
                    <td>{end.toLocaleTimeString()}</td>
                    <td>{`${minutes}m ${seconds}s`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Admin Dashboard Table */}
          {adminEmails.includes(user.email) && (
            <>
              <h3 style={{ marginTop: '3rem', color: 'darkred' }}>👑 Admin Dashboard – All Logs</h3>
              <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {allLogs.map((log, index) => {
                    const start = new Date(log.start.seconds * 1000);
                    const end = new Date(log.end.seconds * 1000);
                    const durationMs = end - start;
                    const minutes = Math.floor(durationMs / 60000);
                    const seconds = Math.floor((durationMs % 60000) / 1000);
                    return (
                      <tr key={index}>
                        <td>{log.email}</td>
                        <td>{start.toLocaleString()}</td>
                        <td>{end.toLocaleString()}</td>
                        <td>{`${minutes}m ${seconds}s`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
