// pages/PrescriptionsPage.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../App';
import PrescriptionList from '../components/PrescriptionList';

const PrescriptionsPage = () => {
  const { userRole } = useContext(AuthContext);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Prescriptions</h1>
      <PrescriptionList userRole={userRole} />
    </div>
  );
};

export default PrescriptionsPage;