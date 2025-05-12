//Revenue - Cost
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RevenueCostForm from '../components/RevenueCostForm';

const RevenueCostPage = () => {
  const [entries, setEntries] = useState([]);

  const fetchEntries = async () => {
    try {
      const response = await axios.get('/api/revenuecost');
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleNewEntry = (newEntry) => {
    setEntries([newEntry, ...entries]); // Add the new entry at the top
  };

  return (
    <div>
      <h1>Revenue and Costs</h1>
      <RevenueCostForm onSubmit={handleNewEntry} />
      <div>
        <h2>Entries</h2>
        <ul>
          {entries.map((entry) => (
            <li key={entry._id}>
              {entry.type}: {entry.amount} - {entry.description} ({entry.date})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RevenueCostPage;