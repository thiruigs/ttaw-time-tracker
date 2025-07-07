import React, { useEffect, useState } from 'react';

export default function StaffReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // In future: fetch user's own timeLogs here
    setReports([]); // Placeholder
  }, []);

  return (
    <div>
      <h2>My Time Reports</h2>
      {reports.length === 0 ? (
        <p>No reports available yet.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Client</th>
              <th>Project</th>
              <th>Task</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration (s)</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((log, index) => (
              <tr key={index}>
                <td>{log.clientName}</td>
                <td>{log.projectName}</td>
                <td>{log.taskName}</td>
                <td>{new Date(log.startTime).toLocaleString()}</td>
                <td>{new Date(log.endTime).toLocaleString()}</td>
                <td>{log.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
