import axios from 'axios';

export const getAvailableDoctors = async () => {
  const res = await axios.get('/api/appointments/doctors');
  return res.data;
};

export const bookAppointment = async (appointment) => {
  const token = localStorage.getItem('token');
  const res = await axios.post('/api/appointments/book', appointment, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAppointments = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('/api/appointments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

