import axios from 'axios';

export const getDoctorProfile = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('/api/doctor/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};