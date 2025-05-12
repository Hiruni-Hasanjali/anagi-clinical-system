//Schedule Card
import React from 'react';

const ScheduleCard = ({ doctor }) => {
  if (!doctor || !doctor.name || !doctor.email || !doctor.specialization || !Array.isArray(doctor.appointments)) {
    return <div className="schedule-card"><p>Invalid doctor data provided.</p></div>;
  }

  return (
    <div className="schedule-card">
      <h3>Dr. {doctor.name}</h3>
      <p>Email: {doctor.email}</p>
      <p>Specialization: {doctor.specialization}</p>
      <h4>Today's Appointments</h4>
      <ul>
        {doctor.appointments.map((appt, idx) => (
          appt && appt.time && appt.patientName ? (
            <li key={idx}>{appt.time} - {appt.patientName}</li>
          ) : (
            <li key={idx}>Invalid appointment data</li>
          )
        ))}
      </ul>
    </div>
  );
};

export default ScheduleCard;
