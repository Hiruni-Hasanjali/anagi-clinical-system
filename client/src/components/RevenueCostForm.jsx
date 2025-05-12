//RevenueCost Form
import React, { useState } from 'react';
import axios from 'axios';

const RevenueCostForm = ({ onSubmit }) => {
  const [type, setType] = useState('revenue');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number.';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }
    if (!date) {
      newErrors.date = 'Date is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newEntry = { type, amount, description, date };
    try {
      const response = await axios.post('/api/revenuecost/add', newEntry);
      onSubmit(response.data); // Trigger parent function after successful submit
      setAmount(''); setDescription(''); setDate(''); setErrors({});
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Type:
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="revenue">Revenue</option>
          <option value="cost">Cost</option>
        </select>
      </label>
      <label>
        Amount:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {errors.amount && <span style={{ color: 'red' }}>{errors.amount}</span>}
      </label>
      <label>
        Description:
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && <span style={{ color: 'red' }}>{errors.description}</span>}
      </label>
      <label>
        Date:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.date && <span style={{ color: 'red' }}>{errors.date}</span>}
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default RevenueCostForm;
