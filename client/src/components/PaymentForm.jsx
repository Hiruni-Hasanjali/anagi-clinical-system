// Payment component
import React, { useState } from 'react';
import { makeCardPayment } from '../services/paymentService';

const PaymentForm = () => {
  const [paymentData, setPaymentData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    amount: '',
  });

  const [error, setError] = useState(''); // **Added for error messages**

  const handleChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { name, cardNumber, expiry, cvc, amount } = paymentData;

    if (!name || !cardNumber || !expiry || !cvc || !amount) {
      setError('All fields are required.');
      return false;
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      setError('Card number must be 16 digits.');
      return false;
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      setError('CVC must be 3 or 4 digits.');
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError('Expiry must be in MM/YY format.');
      return false;
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      setError('Amount must be a positive number.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await makeCardPayment(paymentData);
      alert('Payment successful');
      setPaymentData({
        name: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
        amount: '',
      });
    } catch (err) {
      alert('Payment failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Pay with Card</h3>
      **{error && <p style={{ color: 'red' }}>{error}</p>}**
      <input name="name" placeholder="Name" value={paymentData.name} onChange={handleChange} required />
      <input name="cardNumber" placeholder="Card Number" value={paymentData.cardNumber} onChange={handleChange} required />
      <input name="expiry" placeholder="Expiry MM/YY" value={paymentData.expiry} onChange={handleChange} required />
      <input name="cvc" placeholder="CVC" value={paymentData.cvc} onChange={handleChange} required />
      <input name="amount" placeholder="Amount" type="number" value={paymentData.amount} onChange={handleChange} required />
      <button type="submit">Pay</button>
    </form>
  );
};

export default PaymentForm;