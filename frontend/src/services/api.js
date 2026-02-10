import axios from 'axios';

// Base URL for backend API
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// ERROR INTERCEPTOR - FIX FOR TEST 1.5
// ============================================
// Transforms backend error responses into user-friendly messages
api.interceptors.response.use(
  response => response, // Pass through successful responses
  error => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Create user-friendly error message
      let userMessage = '';

      if (status === 409) {
        // Duplicate phone number - use backend message
        userMessage =
          // data.message || 'A patient with this phone number already exists';
          data.message || 'Đã có bệnh nhân với số điện thoại này';
      } else if (status === 404) {
        // userMessage = data.message || 'Resource not found';
        userMessage = data.message || 'Không tìm thấy dữ liệu';
      } else if (status === 400) {
        // userMessage = data.message || 'Invalid data provided';
        userMessage = data.message || 'Dữ liệu không hợp lệ đã được cung cấp';
      } else if (status === 500) {
        userMessage =
          // data.message || 'Server error occurred. Please try again.';
          data.message || 'Đã xảy ra lỗi bên máy chủ. Vui lòng thử lại.';
      } else {
        // userMessage = data.message || 'An error occurred';
        userMessage = data.message || 'Đã xảy ra lỗi';
      }

      // Create new error with user-friendly message
      const enhancedError = new Error(userMessage);
      enhancedError.response = error.response;
      enhancedError.originalError = error;

      return Promise.reject(enhancedError);
    } else if (error.request) {
      // Request made but no response
      const networkError = new Error(
        'Cannot connect to server. Please check your connection.'
      );
      networkError.request = error.request;
      return Promise.reject(networkError);
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

// Patient API endpoints
export const patientAPI = {
  // Get all patients
  getAll: () => api.get('/patients'),

  // Get single patient by ID
  getById: id => api.get(`/patients/${id}`),

  // Create new patient
  create: patient => api.post('/patients', patient),

  // Update existing patient
  update: (id, patient) => api.put(`/patients/${id}`, patient),

  // Delete patient
  delete: id => api.delete(`/patients/${id}`),
};

// Appointment API endpoints
export const appointmentAPI = {
  // Get all appointments
  getAll: () => api.get('/appointments'),

  // Get single appointment by ID
  getById: id => api.get(`/appointments/${id}`),

  // Create new appointment
  create: appointment => api.post('/appointments', appointment),

  // Update existing appointment
  update: (id, appointment) => api.put(`/appointments/${id}`, appointment),

  // Delete appointment
  delete: id => api.delete(`/appointments/${id}`),

  // MAIN ENDPOINT: Get appointments with patient data (for UI)
  getWithPatients: params => {
    return api.get('/appointments/with-patients', { params });
  },
};

// Export the base api instance as default
export default api;
