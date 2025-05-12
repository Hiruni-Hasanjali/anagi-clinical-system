//Diary List Component
import React, { useEffect, useState } from 'react';
import { getDiaryEntries } from '../services/diaryService';

const DiaryList = () => {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  const fetchEntries = async () => {
    try {
    const data = await getDiaryEntries();
    if (!data || data.length === 0) {
      setError('No diary entries found.');
      setEntries([]);
    } else {
    setEntries(data);
    setError('');
    }
  } catch (err) {
    setError('Failed to fetch diary entries. Please try again later.');
  }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div>
      <h3>Your Diary Entries</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <ul>
        {entries.map((item) => (
          <li key={item._id}><strong>{item.date}</strong>: {item.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default DiaryList;
