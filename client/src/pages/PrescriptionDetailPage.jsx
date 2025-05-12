// pages/PrescriptionDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../config/api';
import PrescriptionDetail from '../components/PrescriptionDetail';

const PrescriptionDetailPage = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      const response = await apiClient.get(`/api/prescriptions/${id}`);
      setPrescription(response.data.prescription);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch prescription');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Prescription</h1>
      {prescription && <PrescriptionDetail prescription={prescription} />}
    </div>
  );
};

export default PrescriptionDetailPage;