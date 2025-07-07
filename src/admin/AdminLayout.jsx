import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


export default function AdminLayout() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/signin');
  };
  
  const location = useLocation();

  return (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    {/* Sidebar */}
    <nav
      style={{
        width: '240px',
        backgroundColor: '#f0f0f0',
        padding: '1rem',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
      }}
    >
      <h2>Admin Panel</h2>
      <ul style={{ listStyle: 'none', paddingLeft: 0, lineHeight: '2.2' }}>
        <li><Link to="/admin">🏠 Home</Link></li>        
        <li><Link to="/admin/clients">👤 Clients</Link></li>
        <li>
          <strong>📁 Projects</strong>
          <ul style={{ listStyle: 'none', paddingLeft: '1rem' }}>
            <li><Link to="/admin/projects/create">➕ Create Project</Link></li>
            <li><Link to="/admin/projects/assign-staff">👥 Assign Staff</Link></li>
            {/*<li><Link to="/admin/projects/remove-staff">❌ Remove Staff</Link></li>*/}
            <li><Link to="/admin/projects/assign-task">📝 Assign Task</Link></li>
            {/*<li><Link to="/admin/projects/remove-task">🗑️ Remove Task</Link></li>*/}
          </ul>
        </li>
        <li><Link to="/admin/tasks">📝 Tasks</Link></li>        
        <li><Link to="/admin/teams">👨‍👩‍👧‍👦 Teams</Link></li>
        <li><Link to="/admin/staff">🙍 People</Link></li>
        <li><Link to="/admin/staff-types">🔑 Staff Types</Link></li>
        <li><Link to="/admin/shift-times">⏱️ Shift Time</Link></li>
        <li>------------------------------</li>
        <li><Link to="/admin/my-timesheet">🕒 My Timesheet</Link></li>
        <li><Link to="/admin/reports">📊 Reports</Link></li>
        <li><Link to="/admin/settings">⚙️ Settings</Link></li>
        <li><Link to="/admin/leave">📝 Leave</Link></li>
        <li><Link to="/admin/attendance">📅 Attendance</Link></li>
      </ul>
    </nav>

    {/* Main Content Area */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div
  style={{
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}
>
  {/*<h3 style={{ margin: 0 }}>Admin Dashboard</h3>*/}

  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <span style={{ fontWeight: 'bold', marginRight: '1rem' }}>
      {localStorage.getItem('userEmail')}
    </span>
    <button
      onClick={() => {
        localStorage.clear();
        window.location.href = '/signin';
      }}
      style={{
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      🚪 Logout
    </button>
  </div>
</div>


      {/* Outlet Content */}
      <div style={{ padding: '2rem', flex: 1 }}>
        <Outlet />
      </div>
    </div>
  </div>
);

}
