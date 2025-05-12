// pages/PatientDashboard.jsx - Fixed version
import React, { useEffect, useState } from 'react';
import { apiClient } from '../config/api';
import { AuthContext } from '../App';
import jsPDF from 'jspdf';

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = React.useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);

  const [feedbackModal, setFeedbackModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch patient profile
      const profileResponse = await apiClient.get('/api/patients/profile');
      setProfile(profileResponse.data.patient);

      // Fetch appointments
      const appointmentsResponse = await apiClient.get('/api/appointments/my-appointments');
      setAppointments(appointmentsResponse.data.appointments);
      
      // Fetch invoices
      const invoicesResponse = await apiClient.get('/api/invoices');
      setInvoices(invoicesResponse.data.invoices);

      // Fetch prescriptions
      const prescriptionsResponse = await apiClient.get('/api/prescriptions/my-prescriptions');
      setPrescriptions(prescriptionsResponse.data.prescriptions || []);
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await apiClient.put(`/api/appointments/${appointmentId}/cancel`);
      fetchData();
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const checkFeedback = async (appointmentId) => {
  try {
      const response = await apiClient.get(`/api/feedback/appointment/${appointmentId}`);
      return response.data.hasFeedback;
    } catch (error) {
      return false;
    }
  };

  const submitFeedback = async () => {
  try {
    await apiClient.post('/api/feedback', {
      appointmentId: selectedAppointment._id,
      rating: feedbackData.rating,
      comment: feedbackData.comment
    });
    
    alert('Feedback submitted successfully!');
    setFeedbackModal(false);
    setSelectedAppointment(null);
    setFeedbackData({ rating: 5, comment: '' });
    fetchData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      const response = await apiClient.get(`/api/invoices/${invoiceId}`);
      const invoice = response.data.invoice;
      
      if (!invoice) {
        throw new Error('Invoice data not found');
      }
      
      const doc = new jsPDF();
  
      // Header
      doc.setFontSize(20);
      doc.text('CLINIC INVOICE', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Invoice Number: ${invoice.invoiceNumber || 'N/A'}`, 20, 40);
      doc.text(`Date: ${invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}`, 20, 50);
      
      // Doctor Info
      if (invoice.doctor) {
        doc.text('From:', 20, 70);
        doc.text(`Dr. ${invoice.doctor.firstName || ''} ${invoice.doctor.lastName || ''}`, 20, 80);
        doc.text(`${invoice.doctor.specialization || 'N/A'}`, 20, 90);
        doc.text(`License: ${invoice.doctor.licenseNumber || 'N/A'}`, 20, 100);
      }
      
      // Patient Info
      if (invoice.patient) {
        doc.text('To:', 120, 70);
        doc.text(`${invoice.patient.firstName || ''} ${invoice.patient.lastName || ''}`, 120, 80);
        doc.text(`${invoice.patient.email || 'N/A'}`, 120, 90);
        doc.text(`${invoice.patient.phone || 'N/A'}`, 120, 100);
      }
      
      // Appointment Details
      if (invoice.appointment) {
        doc.text('Appointment Details:', 20, 120);
        doc.text(`Date: ${invoice.appointment.date ? new Date(invoice.appointment.date).toLocaleDateString() : 'N/A'}`, 20, 130);
        doc.text(`Time: ${invoice.appointment.timeSlot || 'N/A'}`, 20, 140);
        doc.text(`Reason: ${invoice.appointment.reason || 'N/A'}`, 20, 150);
      }
      
      // Services section (without table)
      doc.text('Services:', 20, 170);
      let yPosition = 180;
      
      if (invoice.services && invoice.services.length > 0) {
        invoice.services.forEach((service) => {
          doc.text(`${service.description || 'N/A'}: Rs. ${service.cost ? service.cost.toFixed(2) : '0.00'}`, 20, yPosition);
          yPosition += 10;
        });
      } else {
        doc.text(`Consultation: Rs. ${invoice.totalAmount ? invoice.totalAmount.toFixed(2) : '0.00'}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Total
      doc.setFontSize(14);
      doc.text(`Total Amount: Rs. ${invoice.totalAmount ? invoice.totalAmount.toFixed(2) : '0.00'}`, 20, yPosition + 20);
  
      doc.save(`Invoice_${invoice.invoiceNumber || 'undefined'}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert(`Failed to generate PDF: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-600">Error: {error}</div>;
  }

  const downloadPrescriptionPDF = async (prescriptionId) => {
    try {
      const response = await apiClient.get(`/api/prescriptions/${prescriptionId}`);
      const prescription = response.data.prescription;
      
      if (!prescription) {
        throw new Error('Prescription data not found');
      }
      
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('MEDICAL PRESCRIPTION', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      
      // Doctor Info
      if (prescription.doctor) {
        doc.text('Doctor:', 20, 40);
        doc.text(`Dr. ${prescription.doctor.firstName || ''} ${prescription.doctor.lastName || ''}`, 50, 40);
        doc.text(`Specialization: ${prescription.doctor.specialization || 'N/A'}`, 20, 50);
      }
      
      // Patient Info
      if (prescription.patient) {
        doc.text('Patient:', 20, 70);
        doc.text(`${prescription.patient.firstName || ''} ${prescription.patient.lastName || ''}`, 50, 70);
      }
      
      // Prescription Date
      doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, 20, 90);
      
      // Diagnosis
      doc.text('Diagnosis:', 20, 110);
      doc.text(prescription.diagnosis || 'N/A', 70, 110);
      
      // Medications
      doc.text('Medications:', 20, 130);
      let yPos = 140;
      
      prescription.medications.forEach((med, index) => {
        doc.text(`${index + 1}. ${med.name} - ${med.dosage}`, 30, yPos);
        yPos += 10;
        doc.text(`   Frequency: ${med.frequency}`, 30, yPos);
        yPos += 10;
        doc.text(`   Duration: ${med.duration}`, 30, yPos);
        yPos += 10;
        if (med.instructions) {
          doc.text(`   Instructions: ${med.instructions}`, 30, yPos);
          yPos += 10;
        }
        yPos += 5;
      });
      
      // Notes
      if (prescription.notes) {
        doc.text('Additional Notes:', 20, yPos);
        yPos += 10;
        doc.text(prescription.notes, 30, yPos);
      }
      
      // Doctor's signature
      yPos += 30;
      doc.text('Doctor\'s Signature:', 20, yPos);
      
      doc.save(`Prescription_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert(`Failed to generate PDF: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    let bgColor, textColor;
    switch (status) {
      case 'scheduled':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'completed':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'no-show':
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Patient Dashboard</h1>
      
      {/* Profile Section */}
      {profile && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Name:</p>
              <p className="text-lg font-medium text-gray-800">{profile.firstName} {profile.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email:</p>
              <p className="text-lg font-medium text-gray-800">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone:</p>
              <p className="text-lg font-medium text-gray-800">{profile.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Member Since:</p>
              <p className="text-lg font-medium text-gray-800">{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Appointments</h2>
        
        {appointments.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No appointments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                  <th className="px-4 py-3 text-left font-medium">Doctor</th>
                  <th className="px-4 py-3 text-left font-medium">Specialization</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Reason</th>
                  <th className="px-4 py-3 text-left font-medium">Fee</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr key={appointment._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 border-b">
                      {new Date(appointment.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border-b">{appointment.timeSlot}</td>
                    <td className="px-4 py-3 border-b">
                      Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                    </td>
                    <td className="px-4 py-3 border-b">{appointment.doctor.specialization}</td>
                    <td className="px-4 py-3 border-b">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-4 py-3 border-b">{appointment.reason}</td>
                    <td className="px-4 py-3 border-b font-medium">Rs. {appointment.fee}</td>
                    <td className="px-4 py-3 border-b">
                    {appointment.status === 'scheduled' && new Date(appointment.date) > new Date() && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition duration-200"
                      >
                        Cancel
                      </button>
                    )}
                    {appointment.status === 'completed' && (
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setFeedbackModal(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-200 ml-2"
                      >
                        Give Feedback
                      </button>
                    )}
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6">
          <a 
            href="/echanelling" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition duration-200"
          >
            Book New Appointment
          </a>
        </div>
      </div>

      {/* Prescriptions Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Recent Prescriptions</h2>
          <a 
            href="/prescriptions" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm"
          >
            View All Prescriptions
          </a>
        </div>
        
        {prescriptions && prescriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Doctor</th>
                  <th className="px-4 py-3 text-left font-medium">Diagnosis</th>
                  <th className="px-4 py-3 text-left font-medium">Medications</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.slice(0, 3).map((prescription, index) => (
                  <tr key={prescription._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 border-b">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border-b">
                      Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {prescription.diagnosis.length > 30 
                        ? `${prescription.diagnosis.substring(0, 30)}...` 
                        : prescription.diagnosis}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {prescription.medications.length} medication(s)
                    </td>
                    <td className="px-4 py-3 border-b">
                      <a 
                        href={`/prescriptions/${prescription._id}`}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No prescriptions found.</p>
        )}
      </div>

      {/* Invoices Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Invoices</h2>
        
        {invoices.length === 0 ? (
          <p className="text-gray-600">No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left">Invoice #</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Doctor</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b">
                    <td className="px-4 py-3">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      Dr. {invoice.doctor.firstName} {invoice.doctor.lastName}
                    </td>
                    <td className="px-4 py-3">Rs. {invoice.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => downloadInvoice(invoice._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Feedback for Dr. {selectedAppointment.doctor.firstName} {selectedAppointment.doctor.lastName}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                    className={`text-2xl ${
                      star <= feedbackData.rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
              <textarea
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                className="w-full p-2 border rounded"
                rows="4"
                placeholder="Share your experience..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setFeedbackModal(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;