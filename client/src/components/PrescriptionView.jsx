//Prescription View
import React, { useEffect, useState } from 'react';
import { getPrescriptionsByPatient } from '../../services/prescriptionService';

const PrescriptionView = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPrescriptionsByPatient();
        if (!data || data.length === 0) {
          setError('No prescriptions found.');
          return;
        }
        setPrescriptions(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch prescriptions. Please try again later.');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h3>My Prescriptions</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {prescriptions.length > 0 && prescriptions.map((p) => (
        <div key={p._id}>
          <p><strong>Medications:</strong> {p.medications}</p>
          <p><strong>Notes:</strong> {p.notes}</p>
          <p><strong>Date:</strong> {p.date}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default PrescriptionView;
