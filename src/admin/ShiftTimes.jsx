import React, { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ShiftTimes() {
  const [shiftName, setShiftName] = useState('');
  const [type, setType] = useState('Fixed');
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('18:00');
  const [minHoursHours, setMinHoursHours] = useState('08');
  const [minHoursMinutes, setMinHoursMinutes] = useState('00');
  const [weekDays, setWeekDays] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const weekList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    const q = query(collection(db, 'shiftTimes'), where('recordStatus', '==', 'active'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setShifts(data);
  };

  const calculateHours = () => {
    const [fh, fm] = fromTime.split(':').map(Number);
    const [th, tm] = toTime.split(':').map(Number);
    let start = fh * 60 + fm;
    let end = th * 60 + tm;
    if (end < start) end += 24 * 60;
    const total = end - start;
    const breakMins = 60;
    const work = total - breakMins;
    return {
      workHours: (work / 60).toFixed(2),
      breakHours: (breakMins / 60).toFixed(2),
      totalHours: (total / 60).toFixed(2),
    };
  };

  const toggleDay = (day) => {
    setWeekDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const saveShift = async () => {
    setError('');
    if (!shiftName) return setError('Shift Name is required.');
    if (type === 'Fixed' && (!fromTime || !toTime || weekDays.length === 0)) {
      return setError('Please complete all Fixed shift fields.');
    }
    if (type === 'Flexible' && (!minHoursHours || !minHoursMinutes)) {
      return setError('Min hours required for Flexible shift.');
    }

    const payload = {
      name: shiftName,
      type,
      recordStatus: 'active',
      updatedAt: serverTimestamp(),
    };

    if (type === 'Fixed') {
      const hours = calculateHours();
      Object.assign(payload, {
        fromTime,
        toTime,
        workHours: hours.workHours,
        breakHours: hours.breakHours,
        totalHours: hours.totalHours,
        days: weekDays,
      });
    } else {
      payload.minHours = `${minHoursHours}:${minHoursMinutes}`;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'shiftTimes', editingId), payload);
        setEditingId(null);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'shiftTimes'), payload);
      }
      setShiftName('');
      setFromTime('09:00');
      setToTime('18:00');
      setMinHoursHours('08');
      setMinHoursMinutes('00');
      setWeekDays([]);
      fetchShifts();
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    }
  };

  const editShift = (s) => {
    setEditingId(s.id);
    setShiftName(s.name || '');
    setType(s.type);
    setFromTime(s.fromTime || '09:00');
    setToTime(s.toTime || '18:00');
    if (s.minHours) {
      const [h, m] = s.minHours.split(':');
      setMinHoursHours(h);
      setMinHoursMinutes(m);
    } else {
      setMinHoursHours('08');
      setMinHoursMinutes('00');
    }
    setWeekDays(s.days || []);
  };

  const deleteShift = async (id) => {
    if (!window.confirm('Delete this shift?')) return;
    await updateDoc(doc(db, 'shiftTimes', id), {
      recordStatus: 'deleted',
      updatedAt: serverTimestamp(),
    });
    fetchShifts();
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Shift Time Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>Shift Name:</label><br />
      <input
        type="text"
        value={shiftName}
        onChange={(e) => setShiftName(e.target.value)}
        placeholder="e.g. Morning Shift"
      /><br /><br />

      <label>Shift Type:</label><br />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="Fixed">Fixed</option>
        <option value="Flexible">Flexible</option>
      </select><br /><br />

      {type === 'Fixed' && (
        <>
          <label>From Time:</label><br />
          <input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} /><br /><br />
          <label>To Time:</label><br />
          <input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} /><br /><br />

          <label>Applicable Days:</label><br />
          {weekList.map(day => (
            <label key={day} style={{ marginRight: '8px' }}>
              <input type="checkbox" checked={weekDays.includes(day)} onChange={() => toggleDay(day)} /> {day}
            </label>
          ))}<br /><br />
        </>
      )}

      {type === 'Flexible' && (
        <>
          <label>Min Working Hours (HH:MM):</label><br />
          <select value={minHoursHours} onChange={(e) => setMinHoursHours(e.target.value)}>
            {Array.from({ length: 13 }, (_, i) => (
              <option key={i} value={String(i).padStart(2, '0')}>
                {String(i).padStart(2, '0')}
              </option>
            ))}
          </select>
          :
          <select value={minHoursMinutes} onChange={(e) => setMinHoursMinutes(e.target.value)}>
            {["00", "15", "30", "45"].map((min) => (
              <option key={min} value={min}>{min}</option>
            ))}
          </select>
          <br /><br />
        </>
      )}

      <button
        onClick={saveShift}
        style={{
          backgroundColor: editingId ? '#ffa500' : '#87ceeb',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {editingId ? 'Update' : 'Save'} Shift
      </button>

      <hr />

      <h3>All Shifts</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Time</th>
            <th>Hours</th>
            <th>Days</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.type}</td>
              <td>{s.type === 'Fixed' ? `${s.fromTime} - ${s.toTime}` : '-'}</td>
              <td>
                {s.type === 'Fixed'
                  ? `${s.workHours} / ${s.breakHours} / ${s.totalHours}`
                  : `${s.minHours} hrs`}
              </td>
              <td>{s.days ? s.days.join(', ') : '-'}</td>
              <td>
                <button onClick={() => editShift(s)}>✏️</button>
                <button onClick={() => deleteShift(s.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
