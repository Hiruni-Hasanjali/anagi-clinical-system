// pages/AppointmentPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { apiClient } from '../config/api';
import './AppointmentPage.css';
import { AuthContext } from '../App'; // Import AuthContext to check user role

// Import the new PrescriptionForm component (we'll create this later)
import PrescriptionForm from '../components/PrescriptionForm';

const AppointmentPage = () => {
  const { user } = useContext(AuthContext); // Get current user
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for prescription modal
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState(null);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get('/api/appointments/my-appointments');
      setAppointments(response.data.appointments);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await apiClient.put(`/api/appointments/${appointmentId}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert('Failed to update appointment status');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await apiClient.put(`/api/appointments/${appointmentId}/cancel`);
      fetchAppointments();
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  // New function to handle prescription submission
  const handlePrescriptionSubmit = (prescription) => {
    setSelectedAppointmentForPrescription(null);
    setPrescriptionSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setPrescriptionSuccess(false);
    }, 3000);
    
    // Refresh appointments to update UI
    fetchAppointments();
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  if (loading) {
    return <div className="loading-state">Loading appointments...</div>;
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  const statusCounts = {
    all: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    'no-show': appointments.filter(a => a.status === 'no-show').length,
  };

  return (
    <div className="appointments-container">
      {prescriptionSuccess && (
        <div className="prescription-success-notification">
          Prescription created successfully!
        </div>
      )}
      
      <div className="appointments-header">
        <h1 className="appointments-title">Appointments</h1>
      </div>
      
      <div className="filter-section">
        <div className="filter-buttons">
          {['all', 'scheduled', 'completed', 'cancelled', 'no-show'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`filter-button ${filter === status ? `active-${status}` : 'inactive'}`}
            >
              {status === 'no-show' ? 'No-Show' : status.charAt(0).toUpperCase() + status.slice(1)} 
              ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      <div className="appointments-table-container">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            No appointments found.
          </div>
        ) : (
          <div className="appointments-table-wrapper">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td>{appointment.timeSlot}</td>
                    <td>
                      <div className="patient-info">
                        <div className="patient-name">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-phone">{appointment.patient.phone}</div>
                        <div className="contact-email">{appointment.patient.email}</div>
                      </div>
                    </td>
                    <td>{appointment.reason}</td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>
                      {appointment.status === 'scheduled' && (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                            className="action-button btn-complete"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'no-show')}
                            className="action-button btn-no-show"
                          >
                            No-Show
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="action-button btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      
                      {/* New button for creating prescriptions for completed appointments */}
                      {user?.role === 'doctor' && appointment.status === 'completed' && (
                        <div className="action-buttons">
                          <button
                            onClick={() => setSelectedAppointmentForPrescription(appointment)}
                            className="action-button btn-prescription"
                          >
                            Create Prescription
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Prescription Form Modal */}
      {selectedAppointmentForPrescription && (
        <div className="modal-overlay">
          <div className="prescription-modal">
            <div className="modal-header">
              <h2>Create Prescription</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setSelectedAppointmentForPrescription(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <PrescriptionForm 
                appointment={selectedAppointmentForPrescription}
                onSubmit={handlePrescriptionSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;