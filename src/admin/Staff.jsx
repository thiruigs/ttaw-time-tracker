import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import CryptoJS from 'crypto-js';

export default function Staff() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teamId, setTeamId] = useState('');
  const [staffType, setStaffType] = useState('');
  const [shiftTimeId, setShiftTimeId] = useState('');
  const [teams, setTeams] = useState([]);
  const [shiftTimes, setShiftTimes] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [staffTypes, setStaffTypes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [teamSnap, shiftSnap, staffSnap, staffTypeSnap] = await Promise.all([
      getDocs(query(collection(db, 'teams'), where('recordStatus', '==', 'active'))),
      getDocs(query(collection(db, 'shiftTimes'), where('recordStatus', '==', 'active'))),
      getDocs(query(collection(db, 'staff'), where('recordStatus', '==', 'active'))),
      getDocs(query(collection(db, 'staffTypes'), where('recordStatus', '==', 'active'))),
    ]);

    setTeams(teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setShiftTimes(shiftSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setStaffList(staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setStaffTypes(staffTypeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePasswordStrength = (pwd) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/.test(pwd);

  const validate = () => {
    if (!name || !email || !password || !confirmPassword || !teamId || !staffType || !shiftTimeId) {
      setError('All fields are required.');
      return false;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (!validatePasswordStrength(password)) {
      setError('Password must be at least 8 characters long and include 1 uppercase letter, 1 number, and 1 special character.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTeamId('');
    setStaffType('');
    setShiftTimeId('');
    setEditingId(null);
    setError('');
  };

  const saveStaff = async () => {
    if (!validate()) return;

    const existingEmail = staffList.find(
      s => s.email.toLowerCase() === email.toLowerCase() && s.id !== editingId
    );
    if (existingEmail) {
      setError('Email already exists.');
      return;
    }

    const hashedPassword = CryptoJS.SHA256(password).toString();

    const payload = {
      name,
      email,
      password: hashedPassword,
      teamId,
      staffType,
      shiftTimeId,
      recordStatus: 'active',
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'staff', editingId), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'staff'), payload);
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Error saving staff.');
    }
  };

  const editStaff = (s) => {
    setEditingId(s.id);
    setName(s.name);
    setEmail(s.email);
    setPassword('');
    setConfirmPassword('');
    setTeamId(s.teamId);
    setStaffType(s.staffType);
    setShiftTimeId(s.shiftTimeId);
  };

  const deleteStaff = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    await updateDoc(doc(db, 'staff', id), {
      recordStatus: 'deleted',
      updatedAt: serverTimestamp(),
    });
    fetchData();
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Create Staff</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>Name:</label><br />
      <input value={name} onChange={(e) => setName(e.target.value)} /><br /><br />

      <label>Email:</label><br />
      <input value={email} onChange={(e) => setEmail(e.target.value)} /><br /><br />

      <label>Password:</label><br />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br /><br />

      <label>Confirm Password:</label><br />
      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /><br /><br />

      <label>Team:</label><br />
      <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
        <option value="">-- Select Team --</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select><br /><br />

      <label>Staff Type:</label><br />
      <select value={staffType} onChange={(e) => setStaffType(e.target.value)}>
        <option value="">-- Select Type --</option>
        {staffTypes.map(type => (
          <option key={type.id} value={type.name}>{type.name}</option>
        ))}
      </select><br /><br />

      <label>Shift Time:</label><br />
      <select value={shiftTimeId} onChange={(e) => setShiftTimeId(e.target.value)}>
        <option value="">-- Select Shift --</option>
        {shiftTimes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select><br /><br />

      <button onClick={saveStaff} style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px' }}>
        {editingId ? 'Update' : 'Save'} Staff
      </button>

      <hr />
      <h3>All Staff</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Team</th>
            <th>Type</th>
            <th>Shift</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffList
            .filter(s => s.staffType !== 'Admin')
            .map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{teams.find(t => t.id === s.teamId)?.name || '-'}</td>
                <td>{s.staffType}</td>
                <td>{shiftTimes.find(st => st.id === s.shiftTimeId)?.name || '-'}</td>
                <td>
                  <button onClick={() => editStaff(s)}>✏️</button>
                  <button onClick={() => deleteStaff(s.id)}>🗑️</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
