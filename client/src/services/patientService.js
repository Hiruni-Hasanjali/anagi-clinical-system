import axios from 'axios';

export const getPatientProfile = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('/api/patient/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
