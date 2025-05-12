import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import AppointmentPage from './pages/AppointmentPage';
import Diary from './pages/Diary';
import DoctorDashboard from './pages/DoctorDashboard';
import Echanelling from './pages/Echanelling';
import LoginRegister from './pages/LoginRegister';
import MedicalHistory from './pages/MedicalHistory';
import MedicalRecords from './pages/MedicalRecords';
import PatientDashboard from './pages/PatientDashboard';
import RevenueCostPage from './pages/RevenueCostPage';
import ScheduleDoctorTime from './pages/ScheduleDoctorTime';
import InvoicePage from './pages/InvoicePage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import PrescriptionDetailPage from './pages/PrescriptionDetailPage';

// Create AuthContext
export const AuthContext = React.createContext(null);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Navbar component
const Navbar = () => {
  const { user, userRole, logout } = React.useContext(AuthContext);
  
  return (
    <nav className="bg-green-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-xl font-bold">Anagi Ayurveda Medical Centre</a>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="whitespace-nowrap">Welcome, {userRole === 'doctor' ? 'Dr.' : ''} {user.firstName}</span>
              {userRole === 'doctor' && (
                <>
                  <a href="/doctor-dashboard" className="hover:underline">Dashboard</a>
                  <a href="/appointments" className="hover:underline">Appointments</a>
                  <a href="/schedule-doctor" className="hover:underline">Schedule</a>
                  <a href="/invoices" className="hover:underline">Invoices</a>
                </>
              )}
              {userRole === 'patient' && (
                <>
                  <a href="/patient-dashboard" className="hover:underline">Dashboard</a>
                  <a href="/echanelling" className="hover:underline whitespace-nowrap">E-Channelling</a>
                </>
              )}
              <button 
                onClick={logout} 
                className="hover:underline"
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0',
                  font: 'inherit'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <a href="/login" className="hover:underline">Login</a>
          )}
        </div>
      </div>
    </nav>
  );
};

// Footer component
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>© {new Date().getFullYear()} Clinic Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

// Home component
const Home = () => {
  const { user, userRole } = React.useContext(AuthContext);
  
  return (
    <div className="container mx-auto p-8 text-center">
      {/* Doctor-specific content */}
      {userRole === 'doctor' && (
        <>
          <h1 className="text-3xl font-bold mb-6">Welcome to Clinic Management System</h1>
          <h2 className="text-xl mb-4">Hello, Dr. {user.firstName} {user.lastName}!</h2>
          <p className="mb-8">Your comprehensive solution for healthcare management</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">View Appointments</h2>
              <p className="mb-4">Check your scheduled appointments</p>
              <a href="/appointments" className="text-green-600 hover:underline">View Appointments</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Schedule Management</h2>
              <p className="mb-4">Manage your available time slots</p>
              <a href="/schedule-doctor" className="text-green-600 hover:underline">Manage Schedule</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Invoices</h2>
              <p className="mb-4">View and manage patient invoices</p>
              <a href="/invoices" className="text-green-600 hover:underline">View Invoices</a>
            </div>
          </div>
        </>
      )}
      
      {/* Patient-specific content with encouraging message */}
      {userRole === 'patient' && (
        <>
          <h1 className="text-3xl font-bold mb-6">Take Control of Your Health Journey</h1>
          <h2 className="text-xl mb-4">Hi, {user.firstName}! 👋</h2>
          <p className="mb-8 text-lg">Your health is our priority. Book appointments easily and stay on top of your wellness journey.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Patient Dashboard</h2>
              <p className="mb-6 text-gray-600">View your profile and appointments</p>
              <a href="/patient-dashboard" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200">
                Go to Dashboard
              </a>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">E-Channelling</h2>
              <p className="mb-6 text-gray-600">Book appointments with our doctors</p>
              <a href="/echanelling" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200">
                Book Appointment
              </a>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">My Prescriptions</h2>
              <p className="mb-6 text-gray-600">View and download your prescriptions</p>
              <a href="/prescriptions" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200">
                View Prescriptions
              </a>
            </div>
          </div>
        </>
      )}
      
      {/* Default content if not logged in */}
      {!userRole && (
        <>
          <h1 className="text-3xl font-bold mb-6">Welcome to Clinic Management System</h1>
          <p className="mb-8">Your comprehensive solution for healthcare management</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Get Started</h2>
              <p className="mb-4">Login or register to access all features</p>
              <a href="/login" className="text-green-600 hover:underline">Login / Register</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">About Us</h2>
              <p className="mb-4">Learn more about our clinic services</p>
              <a href="#" className="text-green-600 hover:underline">Learn More</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Contact</h2>
              <p className="mb-4">Get in touch with our support team</p>
              <a href="#" className="text-green-600 hover:underline">Contact Us</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  // Check for logged in user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setUserRole(storedRole);
    }
  }, []);
  
  // Auth functions
  const login = (userData, role, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', role);
    setUser(userData);
    setUserRole(role);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setUser(null);
    setUserRole(null);
    window.location.href = '/login';
  };
  
  const authContextValue = {
    user,
    userRole,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />} />
          
          {/* Patient routes */}
          <Route path="/echanelling" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Echanelling />
            </ProtectedRoute>
          } />
          <Route path="/patient-dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          
          {/* Doctor routes */}
          <Route path="/doctor-dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <AppointmentPage />
            </ProtectedRoute>
          } />
          <Route path="/schedule-doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <ScheduleDoctorTime />
            </ProtectedRoute>
          } />
          
          {/* Admin/Doctor routes */}
          <Route path="/revenue-cost" element={
            <ProtectedRoute allowedRoles={['admin', 'doctor']}>
              <RevenueCostPage />
            </ProtectedRoute>
          } />
          <Route path="/invoices" element={
            <ProtectedRoute allowedRoles={['admin', 'doctor']}>
              <InvoicePage />
            </ProtectedRoute>
          } />

          {/* Prescription routes - Add these two routes */}
          <Route path="/prescriptions" element={
            <ProtectedRoute allowedRoles={['patient', 'doctor']}>
              <PrescriptionsPage />
            </ProtectedRoute>
          } />
          <Route path="/prescriptions/:id" element={
            <ProtectedRoute allowedRoles={['patient', 'doctor']}>
              <PrescriptionDetailPage />
            </ProtectedRoute>
          } />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={
            <div className="container mx-auto p-8 text-center">
              <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
              <p className="mt-4">The page you're looking for doesn't exist or has been moved.</p>
              <a href="/" className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded">Return Home</a>
            </div>
          } />
        </Routes>
        </main>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
};

export default App;