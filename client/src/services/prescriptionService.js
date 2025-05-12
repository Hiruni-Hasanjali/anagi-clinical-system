import axios from 'axios';

export const createPrescription = async (patientId, data) => {
  const token = localStorage.getItem('token');
  await axios.post(`/api/prescriptions/${patientId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPrescriptionsByPatient = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('/api/prescriptions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};