// src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    doctorLogin: `${API_BASE_URL}/api/doctors/login`,
    doctorRegister: `${API_BASE_URL}/api/doctors/register`,
    patientLogin: `${API_BASE_URL}/api/patients/login`,
    patientRegister: `${API_BASE_URL}/api/patients/register`,
  },
  
  // Doctor endpoints
  doctor: {
    profile: `${API_BASE_URL}/api/doctors/profile`,
    schedule: `${API_BASE_URL}/api/doctors/schedule`,
  },
  
  // Patient endpoints
  patient: {
    profile: `${API_BASE_URL}/api/patients/profile`,
    appointments: `${API_BASE_URL}/api/appointments`,
  },
  
  appointments: {
    availableDoctors: '/api/appointments/available-doctors',
    book: '/api/appointments/book',
    myAppointments: '/api/appointments/my-appointments',
    cancel: (id) => `/api/appointments/${id}/cancel`,
    doctorSlots: (doctorId) => `/api/appointments/doctor/${doctorId}/slots`
  }
};

// Axios instance with default configuration
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API_BASE_URL;