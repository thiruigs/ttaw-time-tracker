import React, { useState } from 'react';

export default function MultiSelectTest() {
  const staffOptions = [
    { id: 's1', name: 'Alice' },
    { id: 's2', name: 'Bob' },
    { id: 's3', name: 'Charlie' },
    { id: 's4', name: 'Diana' },
  ];

  const [selected, setSelected] = useState([]);

  const handleChange = (e) => {
    const { options } = e.target;
    const selectedIds = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedIds.push(options[i].value);
      }
    }
    setSelected(selectedIds);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Multiselect Test</h2>
      <select multiple value={selected} onChange={handleChange} style={{ width: '200px', height: '150px' }}>
        {staffOptions.map((staff) => (
          <option key={staff.id} value={staff.id}>
            {staff.name}
          </option>
        ))}
      </select>

      <h3>Selected Staff:</h3>
      <ul>
        {selected.map((id) => (
          <li key={id}>{staffOptions.find((s) => s.id === id)?.name}</li>
        ))}
      </ul>
    </div>
  );
}
