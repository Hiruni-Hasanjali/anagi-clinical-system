//Diary Form Component
import React, { useState } from 'react';
import { addDiaryEntry } from '../services/diaryService';

const DiaryForm = ({ refresh }) => {
  const [entry, setEntry] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry.trim()) {
      setError('Diary entry cannot be empty.');
      return;
    }
    if (entry.length > 1000) {
      setError('Diary entry is too long. Please keep it under 1000 characters.');
      return;
    }
    setError(''); // Clear error on successful validation

    await addDiaryEntry({ content: entry });
    setEntry('');
    refresh();
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>} 

      <textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Write your diary..." rows={5} style={{ width: '100%' }} 
       maxLength={1000}
        />
      <button type="submit">Save Entry</button>
    </form>
  );
};

export default DiaryForm;