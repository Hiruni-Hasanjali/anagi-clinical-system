import axios from 'axios';

export const fetchMedicalHistory = async (patientId) => {
  const res = await axios.get(`/api/history/${patientId}`);
  return res.data;
};
