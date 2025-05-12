import axios from 'axios';

export const fetchCalendarEvents = async () => {
  const res = await axios.get('/api/calendar');
  return res.data;
};