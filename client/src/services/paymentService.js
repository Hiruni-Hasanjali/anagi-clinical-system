// Payment Service
import axios from 'axios';

export const makeCardPayment = async (paymentData) => {
  const response = await axios.post('/api/payment', paymentData);
  return response.data;
};
