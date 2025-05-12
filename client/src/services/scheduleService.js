import axios from 'axios';

export const addSchedule = async (doctorId, scheduleData) => {
  const res = await axios.post(`/api/schedule/${doctorId}`, scheduleData);
  return res.data;
};
