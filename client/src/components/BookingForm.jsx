//Booking Form
import React, { useState } from 'react';
import { bookAppointment } from '../services/appointmentService';

const BookingForm = ({ doctors }) => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedDoctor) {
      setError('Please select a doctor.');
      return;
    }
    if (!date) {
      setError('Please choose a date.');
      return;
    } 
    await bookAppointment({ doctorId: selectedDoctor, date });
    alert('Appointment booked successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <label>Select Doctor:</label>
      <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} required>
        <option value="">--Choose--</option>
        {doctors.map((doc) => (
          <option key={doc._id} value={doc._id}>{doc.name} ({doc.specialization})</option>
        ))}
      </select>

      <label>Choose Date:</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <button type="submit">Book Appointment</button>
    </form>
  );
};

export default BookingForm;