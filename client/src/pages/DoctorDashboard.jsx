// pages/DoctorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { apiClient } from '../config/api';
import { AuthContext } from '../App';

const DoctorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = React.useContext(AuthContext);
  const [incomeData, setIncomeData] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Log the user object to see what ID we're working with
      console.log("User object:", user);
      
      // Fetch doctor profile
      const profileResponse = await apiClient.get('/api/doctors/profile');
      setProfile(profileResponse.data.doctor);

      // Fetch appointments
      const appointmentsResponse = await apiClient.get('/api/appointments/my-appointments');
      const appointmentsData = appointmentsResponse.data.appointments;
      setAppointments(appointmentsData);

      // Fetch income summary
      const incomeResponse = await apiClient.get('/api/doctors/income-summary');
      setIncomeData(incomeResponse.data.summary);

      // Fetch feedback - Important change here: use the doctor ID from the profile response
      try {
        // Get the doctor ID either from user context or from the profile response
        const doctorId = user?.id || profileResponse.data.doctor._id;
        
        if (doctorId) {
          console.log("Fetching feedback with doctor ID:", doctorId);
          const feedbackResponse = await apiClient.get(`/api/feedback/doctor/${doctorId}`);
          console.log("Feedback response:", feedbackResponse.data);
          
          setFeedbackStats({
            averageRating: feedbackResponse.data.averageRating,
            totalFeedbacks: feedbackResponse.data.totalFeedbacks
          });
          
          // Set the actual feedback data
          setFeedbackData(feedbackResponse.data.feedbacks || []);
        } else {
          console.warn("Cannot fetch feedback - missing doctor ID");
          setFeedbackStats({
            averageRating: 0,
            totalFeedbacks: 0
          });
          setFeedbackData([]);
        }
      } catch (feedbackError) {
        console.error("Error fetching feedback:", feedbackError);
        console.error("Response data:", feedbackError.response?.data);
        // Continue with the dashboard even if feedback fails
        setFeedbackStats({
          averageRating: 0,
          totalFeedbacks: 0
        });
        setFeedbackData([]);
      }

      // Fetch prescriptions
      try {
        const prescriptionsResponse = await apiClient.get('/api/prescriptions/my-prescriptions');
        setPrescriptions(prescriptionsResponse.data.prescriptions || []);
        console.log("Prescriptions fetched:", prescriptionsResponse.data.prescriptions);
      } catch (prescriptionError) {
        console.error("Error fetching prescriptions:", prescriptionError);
        setPrescriptions([]);
      }

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const stats = {
        totalAppointments: appointmentsData.length,
        todayAppointments: appointmentsData.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        }).length,
        upcomingAppointments: appointmentsData.filter(apt => 
          new Date(apt.date) > new Date() && apt.status === 'scheduled'
        ).length,
        completedAppointments: appointmentsData.filter(apt => 
          apt.status === 'completed'
        ).length
      };
      
      setStats(stats);
      setLoading(false);
    } catch (err) {
      console.error("Error in fetchData:", err);
      console.error("Response data:", err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await apiClient.put(`/api/appointments/${appointmentId}/status`, { status: newStatus });
      fetchData(); // Refresh data
    } catch (err) {
      alert('Failed to update appointment status');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-600">Error: {error}</div>;
  }

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

  // Get today's appointments
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return aptDate > today && aptDate <= nextWeek && apt.status === 'scheduled';
  });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Doctor Dashboard</h1>
      
      {/* Profile Section */}
      {profile && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome, Dr. {profile.firstName} {profile.lastName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Specialization</p>
              <p className="text-lg font-medium">{profile.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">License Number</p>
              <p className="text-lg font-medium">{profile.licenseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Consultation Fee</p>
              <p className="text-lg font-medium">Rs. {profile.consultationFee}</p>
            </div>
            {/* Add rating here inside the profile section */}
            {feedbackStats && (
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="text-lg font-medium">
                  ⭐ {feedbackStats.averageRating}/5.0 
                  <span className="text-sm text-gray-500 ml-2">
                    ({feedbackStats.totalFeedbacks} reviews)
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Appointments</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalAppointments}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600">Today's Appointments</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.todayAppointments}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600">Upcoming Appointments</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.upcomingAppointments}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600">Completed Appointments</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.completedAppointments}</p>
        </div>
      </div>

      {/* Income Summary Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Income Summary</h2>
        {incomeData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Total Income</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">Rs. {incomeData.totalIncome.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{incomeData.totalInvoices} appointments</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">This Month</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">Rs. {incomeData.monthlyIncome.toFixed(2)}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Today's Income</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">Rs. {incomeData.todayIncome.toFixed(2)}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Completed Payments</h3>
              <p className="text-2xl font-bold text-yellow-600 mt-2">Rs. {incomeData.pendingIncome.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{incomeData.pendingInvoices} invoices</p>
            </div>
          </div>
        )}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Today's Appointments</h2>
        {todayAppointments.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No appointments scheduled for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                  <th className="px-4 py-3 text-left font-medium">Reason</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Contact</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((appointment, index) => (
                  <tr key={appointment._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 border-b">{appointment.timeSlot}</td>
                    <td className="px-4 py-3 border-b">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </td>
                    <td className="px-4 py-3 border-b">{appointment.reason}</td>
                    <td className="px-4 py-3 border-b">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-4 py-3 border-b">{appointment.patient.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Upcoming Appointments (Next 7 Days)</h2>
        {upcomingAppointments.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No upcoming appointments in the next 7 days.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                  <th className="px-4 py-3 text-left font-medium">Reason</th>
                  <th className="px-4 py-3 text-left font-medium">Contact</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment, index) => (
                  <tr key={appointment._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 border-b">
                      {new Date(appointment.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border-b">{appointment.timeSlot}</td>
                    <td className="px-4 py-3 border-b">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </td>
                    <td className="px-4 py-3 border-b">{appointment.reason}</td>
                    <td className="px-4 py-3 border-b">{appointment.patient.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6">
          <a 
            href="/appointments" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200"
          >
            View All Appointments
          </a>
        </div>
      </div>

      {/* Prescription History Section */}
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
              <th className="px-4 py-3 text-left font-medium">Patient</th>
              <th className="px-4 py-3 text-left font-medium">Diagnosis</th>
              <th className="px-4 py-3 text-left font-medium">Medications</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.slice(0, 5).map((prescription, index) => (
              <tr key={prescription._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-3 border-b">
                  {new Date(prescription.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 border-b">
                  {prescription.patient.firstName} {prescription.patient.lastName}
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                    prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                  </span>
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
          <p className="text-gray-600 text-center py-4">No prescriptions created yet.</p>
        )}
      </div>

      {/* Recent Feedback Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Recent Feedback</h2>
        {feedbackData && feedbackData.length > 0 ? (
          <div className="space-y-4">
            {feedbackData.slice(0, 5).map((feedback) => (
              <div key={feedback._id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">
                      {feedback.patient.firstName} {feedback.patient.lastName}
                    </span>
                    <div className="text-yellow-500">
                      {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {feedback.comment && (
                  <p className="text-gray-600">{feedback.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No feedback yet.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;