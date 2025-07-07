// src/pages/admin/AdminHome.jsx
//import React from 'react';

/*export default function AdminHome() {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>Welcome to Admin Dashboard</h2>
      <p>This is the admin home page.</p>
    </div>
  );
}*/

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AdminDashboard = () => {
  const [totalStaff, setTotalStaff] = useState(0);
  const [activeToday, setActiveToday] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalLogsToday, setTotalLogsToday] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch staff count
    //const staffSnap = await getDocs(collection(db, 'staff'));

    const staffSnap = await getDocs(
    query(
      collection(db, 'staff'),
      where('recordStatus', '==', 'active'),
      where('staffType', '!=', 'Admin')
    )
    );
    setTotalStaff(staffSnap.size);

    
    // Fetch client count
    const clientSnap = await getDocs(collection(db, 'clients'));
    setTotalClients(clientSnap.size);

    // Fetch project count
    const projectSnap = await getDocs(collection(db, 'projects'));
    setTotalProjects(projectSnap.size);

    // Fetch today's logs
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const firestoreStart = Timestamp.fromDate(startOfDay);

    const logsQuery = query(
      collection(db, 'timeLogs'),
      where('createdAt', '>=', firestoreStart)
    );

    const logsSnap = await getDocs(logsQuery);
    setTotalLogsToday(logsSnap.size);

    // Count unique users active today
    const uniqueUsers = new Set();
    logsSnap.forEach(doc => {
      const data = doc.data();
      if (data.uid) {
        uniqueUsers.add(data.uid);
      }
    });
    setActiveToday(uniqueUsers.size);
  };

  return (
    <div>
      <h2>📊 Admin Dashboard</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Card title="Total Staff" value={totalStaff} />
        <Card title="Active Today" value={activeToday} />
        <Card title="Total Clients" value={totalClients} />
        <Card title="Total Projects" value={totalProjects} />
        <Card title="Logs Today" value={totalLogsToday} />
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div style={{
    flex: '1 1 200px',
    background: '#f1f5f9',
    borderRadius: '10px',
    padding: '1.2rem',
    textAlign: 'center',
    boxShadow: '0 0 5px rgba(0,0,0,0.1)'
  }}>
    <h4>{title}</h4>
    <p style={{ fontSize: '2rem', margin: 0 }}>{value}</p>
  </div>
);

export default AdminDashboard;
