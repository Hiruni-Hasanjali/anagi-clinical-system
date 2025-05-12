//ApointmentList Component
import React, { useEffect, useState } from 'react';
import { getAppointments } from "../services/appointmentService";

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
        const data = await getAppointments();
        if (data.length === 0) {
        setError('No upcoming appointments found.');
    }
    else {
        setError('');
        setAppointments(data);
    }
} catch (err) {
  setError('Failed to fetch appointments. Please try again later.');
}
};

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div>
      <h3>Your Upcoming Appointments</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment._id}>
            <strong>Doctor: </strong>{appointment.doctor.name}<br />
            <strong>Date: </strong>{appointment.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppointmentList;