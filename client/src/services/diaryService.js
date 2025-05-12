import axios from 'axios';

export const getDiaryEntries = async () => {
  const res = await axios.get('/api/diary');
  return res.data;
};

export const addDiaryEntry = async (entry) => {
  const res = await axios.post('/api/diary', entry);
  return res.data;
};