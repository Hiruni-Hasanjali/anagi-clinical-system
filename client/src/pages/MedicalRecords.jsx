// client/src/pages/MedicalRecords.jsx
import { useEffect, useState } from 'react';

function MedicalRecords({ userId }) {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({ type: '', content: '' });

  useEffect(() => {
    fetch(`/api/shared/${userId}`)
      .then((res) => res.json())
      .then(setRecords)
      .catch(console.error);
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/shared', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newRecord, userId }),
    });
    const data = await res.json();
    setRecords([...records, data]);
  };

  return (
    <div>
      <h2>Medical Records</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type (e.g. prescription, diary)"
          value={newRecord.type}
          onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
        />
        <textarea
          placeholder="Content"
          value={newRecord.content}
          onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
        />
        <button type="submit">Add Record</button>
      </form>

      <ul>
        {records.map((r) => (
          <li key={r._id}><strong>{r.type}</strong>: {r.content} ({new Date(r.date).toLocaleString()})</li>
        ))}
      </ul>
    </div>
  );
}

export default MedicalRecords;
