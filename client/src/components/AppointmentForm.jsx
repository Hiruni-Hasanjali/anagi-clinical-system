// AppointmentForm component
import React, { useState, useEffect } from 'react';
import { bookAppointment } from '../services/appointmentService';

const AppointmentForm = ({ refresh }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      const data = await getAvailableDoctors();
      setDoctors(data);
    };

    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear Previous Errors
    if (!selectedDoctor) {
        setError('Please select a doctor.');
        return;
      }
      if (!appointmentDate) {
        setError('Please select an appointment date.');
        return;
      }

    if (selectedDoctor && appointmentDate) {
      await bookAppointment({ doctorId: selectedDoctor, date: appointmentDate });
      setAppointmentDate('');
      refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Book an Appointment</h3>
      <label>
        Select Doctor:
        <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} required>
          <option value="">--Select Doctor--</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>{doctor.name} ({doctor.specialization})</option>
          ))}
        </select>
      </label>
      <label>
        Appointment Date:
        <input
          type="date"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          required
        />
      </label>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Book Appointment</button>
    </form>
  );
};

export default AppointmentForm;
