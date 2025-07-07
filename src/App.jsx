import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  getDocs
} from 'firebase/firestore';

// Admin layout and pages
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import Teams from './admin/Teams';
import Clients from './admin/Clients';
import Projects from './admin/Projects';
import Tasks from './admin/Tasks';
import Staff from './admin/Staff';
import Reports from './admin/Reports';
import MyTimesheet from './admin/MyTimesheet';
import Settings from './admin/Settings';
import Leave from './admin/Leave';
import Attendance from './admin/Attendance';
import StaffTypes from './admin/StaffTypes';
import ShiftTimes from './admin/ShiftTimes';

//import MultiSelectTest from './test/MultiSelectTest';

import CreateProject from './admin/projects/CreateProject';
import AssignStaff from './admin/projects/AssignStaff';
import RemoveStaff from './admin/projects/RemoveStaff';
import AssignTask from './admin/projects/AssignTask';
import RemoveTask from './admin/projects/RemoveTask';

import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Signin from './pages/Signin'; // coming next

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Activate from './pages/Activate';
/*import StaffHome from './pages/StaffHome';*/ // will create this next

import AdminHome from './admin/AdminHome';

/*import TimerPage from './pages/TimerPage';*/

import ActivateAccount from './pages/ActivateAccount';

import StaffLayout from './layouts/StaffLayout';
import StaffHome from './pages/staff/StaffHome';
import TimerPage from './pages/staff/TimerPage';
import StaffReports from './pages/staff/StaffReports';

import FixProjectTasks from './pages/utils/FixProjectTasks';

import FixProjectStaffs from './pages/utils/FixProjectStaffs';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, 'timeLogs'),
          where('uid', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        setLogs(snapshot.docs.map(doc => doc.data()));
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
    setStartTime(new Date());
    setEndTime(null);
  };

  const stopTimer = async () => {
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
      } catch (e) {
        alert("Failed to log time.");
        console.error(e);
      }
    }
    setStartTime(null);
  };

  // Public Home Component
  const LoginOrHome = () => (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🕒 Time Tracker</h1>
      {!user ? (
        <>
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
        </>
      ) : (
        <>
          <h2>Welcome, {user.email}</h2>
          <button onClick={logout}>Logout</button><br /><br />
          {startTime ? (
            <>
              <p>⏱️ Timer started at: {startTime.toLocaleTimeString()}</p>
              <button onClick={stopTimer}>Stop Timer</button>
            </>
          ) : (
            <button onClick={startTimer}>Start Timer</button>
          )}
          {endTime && (
            <p>🛑 Timer stopped at: {endTime.toLocaleTimeString()}</p>
          )}
          <h3>⏳ Time Logs</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.start.seconds * 1000).toLocaleString()}</td>
                  <td>{new Date(log.end.seconds * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );

  return (
  <Router>
    <Routes>
      {/* Root routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="teams" element={<Teams />} />
        <Route path="clients" element={<Clients />} />
        <Route path="staff" element={<Staff />} />
        <Route path="reports" element={<Reports />} />
        <Route path="my-timesheet" element={<MyTimesheet />} />
        <Route path="settings" element={<Settings />} />
        <Route path="leave" element={<Leave />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="staff-types" element={<StaffTypes />} />
        <Route path="shift-times" element={<ShiftTimes />} />
        <Route path="tasks" element={<Tasks />} />

        {/* Project sub-pages under /admin/projects */}
        <Route path="projects/create" element={<CreateProject />} />
        <Route path="projects/assign-staff" element={<AssignStaff />} />
        <Route path="projects/remove-staff" element={<RemoveStaff />} />
        <Route path="projects/assign-task" element={<AssignTask />} />
        <Route path="projects/remove-task" element={<RemoveTask />} />

      </Route>

      

      <Route path="/activate/:code" element={<ActivateAccount />} />

      <Route path="/activate/:id/:token" element={<ActivateAccount />} />

      {/*<Route path="/staff-home" element={<StaffHome />} />
      <Route path="/staff/timer" element={<TimerPage />} />
      <Route path="/staff/reports" element={<Reports />} />*/}


      <Route path="/staff" element={<StaffLayout />}>
        {/*<Route path="home" element={<StaffHome />} />*/}
        <Route path="timer" element={<TimerPage />} />
        {/*<Route path="reports" element={<StaffReports />} />*/}
      </Route>

      <Route path="/fix-project-tasks" element={<FixProjectTasks />} />

      <Route path="/fix-project-staffs" element={<FixProjectStaffs />} />

    </Routes>
  </Router>
);



  //return <MultiSelectTest />;
}

export default App;
