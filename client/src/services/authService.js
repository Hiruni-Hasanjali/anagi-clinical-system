// src/services/authService.js
import { API_ENDPOINTS, apiClient } from '../config/api';

export const authService = {
  // Doctor authentication
  async doctorLogin(email, password) {
    const response = await apiClient.post(API_ENDPOINTS.auth.doctorLogin, { email, password });
    return response.data;
  },
  
  async doctorRegister(data) {
    const response = await apiClient.post(API_ENDPOINTS.auth.doctorRegister, data);
    return response.data;
  },
  
  // Patient authentication
  async patientLogin(email, password) {
    const response = await apiClient.post(API_ENDPOINTS.auth.patientLogin, { email, password });
    return response.data;
  },
  
  async patientRegister(data) {
    const response = await apiClient.post(API_ENDPOINTS.auth.patientRegister, data);
    return response.data;
  },
  
  // Common auth functions
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
  
  getUserRole() {
    return localStorage.getItem('userRole');
  },
  
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};