import axios from 'axios';

export const getNotifications = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('/api/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
