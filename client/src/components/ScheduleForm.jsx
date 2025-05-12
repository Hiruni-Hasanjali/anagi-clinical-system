//Schedule Form
import React, { useState } from 'react';
import { addSchedule } from "../services/scheduleService";

const ScheduleForm = ({ doctorId }) => {
  const [formData, setFormData] = useState({ date: '', time: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      setError('Both date and time are required.');
      return;
    }

    const selectedDate = new Date(formData.date + 'T' + formData.time);
    const now = new Date();
    if (selectedDate < now) {
      setError('Schedule time must be in the future.');
      return;
    }

    setError('');

    try {
      await addSchedule(doctorId, formData);
      alert('Schedule added!');
      setFormData({ date: '', time: '' });
    } catch (err) {
      setError('Failed to add schedule. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Date: <input type="date" name="date" value={formData.date} onChange={handleChange} required /></label>
      <label>Time: <input type="time" name="time" value={formData.time} onChange={handleChange} required /></label>
      <button type="submit">Add Schedule</button>
      **{error && <p style={{ color: 'red' }}>{error}</p>}**
    </form>
  );
};

export default ScheduleForm;
