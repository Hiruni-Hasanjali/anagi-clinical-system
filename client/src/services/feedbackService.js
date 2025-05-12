import axios from 'axios';

export const submitFeedback = async (feedback) => {
  await axios.post('/api/feedback', feedback);
};

export const fetchFeedbacks = async () => {
  const res = await axios.get('/api/feedback');
  return res.data;
};