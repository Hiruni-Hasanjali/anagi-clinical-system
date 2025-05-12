//Medical History
import React from 'react';
import MedicalHistoryList from '../components/MedicalHistoryList';

const MedicalHistory = () => {
  const patientId = 'example-patient-id'; // Replace with actual auth/context-based ID
  return (
    <div style={{ padding: '2rem' }}>
      <h2>View Medical History</h2>
      <MedicalHistoryList patientId={patientId} />
    </div>
  );
};

export default MedicalHistory;