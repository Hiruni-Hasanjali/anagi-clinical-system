// components/PrescriptionList.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { Link } from 'react-router-dom';

const PrescriptionList = ({ userRole }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await apiClient.get('/api/prescriptions/my-prescriptions');
      setPrescriptions(response.data.prescriptions);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch prescriptions');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading prescriptions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (prescriptions.length === 0) {
    return <div className="text-center py-8 text-gray-600">No prescriptions found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="py-3 px-4 text-left">Date</th>
            {userRole === 'doctor' ? (
              <th className="py-3 px-4 text-left">Patient</th>
            ) : (
              <th className="py-3 px-4 text-left">Doctor</th>
            )}
            <th className="py-3 px-4 text-left">Diagnosis</th>
            <th className="py-3 px-4 text-left">Medications</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((prescription) => (
            <tr key={prescription._id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                {new Date(prescription.createdAt).toLocaleDateString()}
              </td>
              {userRole === 'doctor' ? (
                <td className="py-3 px-4">
                  {prescription.patient.firstName} {prescription.patient.lastName}
                </td>
              ) : (
                <td className="py-3 px-4">
                  Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                </td>
              )}
              <td className="py-3 px-4">{prescription.diagnosis}</td>
              <td className="py-3 px-4">
                {prescription.medications.length} medication(s)
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                  prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                </span>
              </td>
              <td className="py-3 px-4">
                <Link 
                  to={`/prescriptions/${prescription._id}`}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrescriptionList;