//Medical History
import React, { useEffect, useState } from 'react';
import { fetchMedicalHistory } from '../services/historyService';

const MedicalHistoryList = ({ patientId }) => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const getHistory = async () => {
      try {
        const data = await fetchMedicalHistory(patientId);

        if (!data || data.length === 0) {
          setError('No medical history found.');
          setHistory([]);
          return;
        }

        setHistory(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch medical history. Please try again later.');
      }
    };

    if (patientId) {
      getHistory();
    } else {
      setError('Patient ID is missing.');
    }
  }, [patientId]);

  return (
    <div>
      <h3>Medical History</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        <ul>
          {history.map((entry, i) => (
            <li key={i}>
              <strong>{entry.date}:</strong> {entry.condition} - {entry.notes}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MedicalHistoryList;

