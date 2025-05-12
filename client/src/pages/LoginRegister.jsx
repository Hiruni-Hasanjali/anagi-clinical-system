import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, apiClient } from '../config/api';
import { AuthContext } from '../App';
import './LoginRegister.css';

const LoginRegister = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [userRole, setUserRole] = useState('patient');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    specialization: '',
    licenseNumber: '',
    phone: '',
    consultationFee: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let endpoint, requestData, response;
      
      if (userRole === 'doctor') {
        endpoint = isRegister 
          ? API_ENDPOINTS.auth.doctorRegister
          : API_ENDPOINTS.auth.doctorLogin;
        
        requestData = isRegister 
          ? formData
          : { email: formData.email, password: formData.password };
      } else {
        endpoint = isRegister 
          ? API_ENDPOINTS.auth.patientRegister
          : API_ENDPOINTS.auth.patientLogin;
        
        requestData = isRegister 
          ? { 
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              password: formData.password,
              phone: formData.phone
            }
          : { email: formData.email, password: formData.password };
      }
      
      console.log('Sending request to:', endpoint);
      console.log('Request data:', requestData);
      
      response = await apiClient.post(endpoint, requestData);
      
      console.log('Response:', response.data);
      
      // Use context login function to update state
      login(response.data.doctor || response.data.patient, userRole, response.data.token);
      
      // Navigate to home page
      navigate('/');
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <h2 className="login-page-title">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {/* Role Selection */}
        <div className="role-selector">
          <button
            className={`role-button ${userRole === 'patient' ? 'active' : ''}`}
            onClick={() => {
              setUserRole('patient');
              setError(''); // Clear error when switching roles
            }}
          >
            Patient
          </button>
          <button
            className={`role-button ${userRole === 'doctor' ? 'active' : ''}`}
            onClick={() => {
              setUserRole('doctor');
              setError(''); // Clear error when switching roles
            }}
          >
            Doctor
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button 
                type="button"
                onClick={() => setError('')}
                className="error-close-button"
              >
                ×
              </button>
            </div>
          )}
          
          {isRegister && (
            <>
              <div className="input-group">
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  onChange={handleChange}
                  value={formData.firstName}
                  required
                  className="input-field"
                  disabled={loading}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  onChange={handleChange}
                  value={formData.lastName}
                  required
                  className="input-field"
                  disabled={loading}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  onChange={handleChange}
                  value={formData.phone}
                  required
                  className="input-field"
                  disabled={loading}
                />
              </div>
              
              {/* Doctor-specific fields */}
              {userRole === 'doctor' && isRegister && (
                <>
                  <div className="input-group">
                    <label className="input-label">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      placeholder="Enter your specialization"
                      onChange={handleChange}
                      value={formData.specialization}
                      required
                      className="input-field"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder="Enter your license number"
                      onChange={handleChange}
                      value={formData.licenseNumber}
                      required
                      className="input-field"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Consultation Fee</label>
                    <input
                      type="number"
                      name="consultationFee"
                      placeholder="Enter your consultation fee"
                      onChange={handleChange}
                      value={formData.consultationFee}
                      required
                      className="input-field"
                      disabled={loading}
                    />
                  </div>
                </>
              )}
            </>
          )}
          
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              value={formData.email}
              required
              className="input-field"
              disabled={loading}
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              value={formData.password}
              required
              className="input-field"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="submit-button" disabled={loading}>
            {loading 
              ? 'Please wait...' 
              : (isRegister ? `Register as ${userRole}` : `Sign In as ${userRole}`)
            }
          </button>
        </form>
        
        <p className="toggle-text">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span 
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                specialization: '',
                licenseNumber: '',
                phone: '',
                consultationFee: ''
              });
            }}
            className="toggle-link"
          >
            {isRegister ? 'Sign in' : 'Register here'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;