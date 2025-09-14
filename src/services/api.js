import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login/customer';
    }
    
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Auth API
export const authAPI = {
  // Customer auth
  registerCustomer: (data) => api.post('/auth/customer/register', data),
  loginCustomer: (data) => api.post('/auth/customer/login', data),
  
  // Provider auth
  registerProvider: (data) => api.post('/auth/provider/register', data),
  loginProvider: (data) => api.post('/auth/provider/login', data),
  
  // Token verification
  verifyToken: () => api.get('/auth/verify'),
};

// Events API
export const eventsAPI = {
  getAllEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  createEvent: (formData) => api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateEvent: (id, formData) => api.put(`/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  likeEvent: (id) => api.post(`/events/${id}/like`),
  addReview: (id, data) => api.post(`/events/${id}/review`, data),
  toggleEventStatus: (id, data) => api.patch(`/events/${id}/status`, data),
};

// Combo Events API
export const comboAPI = {
  getAllCombos: (params) => api.get('/combo', { params }),
  getComboById: (id) => api.get(`/combo/${id}`),
  createCombo: (formData) => api.post('/combo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCombo: (id, formData) => api.put(`/combo/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCombo: (id) => api.delete(`/combo/${id}`),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  cancelBooking: (id, data) => api.patch(`/bookings/${id}/cancel`, data),
  addRating: (id, data) => api.post(`/bookings/${id}/rating`, data),
};

// Payments API
export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getPaymentHistory: (params) => api.get('/payments/history', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
};

// Providers API
export const providersAPI = {
  getAllProviders: (params) => api.get('/provider', { params }),
  getProviderProfile: (id) => api.get(`/provider/profile/${id}`),
  getMyProfile: () => api.get('/provider/profile'),
  getDashboardStats: () => api.get('/provider/dashboard/stats'),
  getEventsByCategory: () => api.get('/provider/events/grouped-by-category'),
  searchEvents: (params) => api.get('/provider/events/search', { params }),
  updateProfile: (formData) => api.put('/provider/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getBookings: (params) => api.get('/provider/bookings', { params }),
  updateBookingStatus: (id, data) => api.patch(`/provider/bookings/${id}/status`, data),
  getAnalytics: (params) => api.get('/provider/analytics', { params }),
  generateInvoice: (bookingId) => api.get(`/provider/bookings/${bookingId}/invoice`, {
    responseType: 'blob'
  }),
  getFollowers: () => api.get('/provider/followers'),
  getMessages: (params) => api.get('/provider/messages', { params }),
  replyToMessage: (messageId, data) => api.post(`/provider/messages/${messageId}/reply`, data),
  markMessageAsRead: (messageId) => api.patch(`/provider/messages/${messageId}/read`),
};

// Customers API
export const customersAPI = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (formData) => api.put('/customer/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => api.get('/customer/stats'),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (data) => api.post('/chatbot/chat', data, { timeout: 60000 }), // 60 second timeout for image generation
  testGemini: () => api.get('/chatbot/test-gemini'),
  performAction: (data) => api.post('/chatbot/action', data),
};

// Search API
export const searchAPI = {
  searchEvents: (params) => api.get('/search/events', { params }),
  searchProviders: (params) => api.get('/search/providers', { params }),
  getSuggestions: (params) => api.get('/search/suggestions', { params }),
};

// Feed API
export const feedAPI = {
  getFeedPosts: (params) => api.get('/feed', { params }),
  createPost: (formData) => api.post('/feed', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  likePost: (id) => api.post(`/feed/${id}/like`),
  addComment: (id, data) => api.post(`/feed/${id}/comment`, data),
  getComments: (id, params) => api.get(`/feed/${id}/comments`, { params }),
};

// Utility functions
export const uploadFile = (file, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
};

export const uploadMultipleFiles = (files, fieldName = 'files') => {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append(fieldName, file);
  });
  return formData;
};

// Customer interactions
export const customerAPI = {
  // Follow/Unfollow provider
  followProvider: (providerId) => api.post(`/customer/follow/${providerId}`),
  unfollowProvider: (providerId) => api.delete(`/customer/follow/${providerId}`),
  getFollowedProviders: () => api.get('/customer/following'),
  checkFollowStatus: (providerId) => api.get(`/customer/follow/status/${providerId}`),
  
  // Reviews
  addReview: (providerId, reviewData) => api.post(`/customer/reviews/${providerId}`, reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/customer/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/customer/reviews/${reviewId}`),
  getMyReviews: () => api.get('/customer/reviews'),
  
  // Messages
  sendMessage: (providerId, messageData) => api.post(`/customer/messages/${providerId}`, messageData),
  getConversations: () => api.get('/customer/conversations'),
  getMessages: (conversationId) => api.get(`/customer/messages/${conversationId}`),
  markAsRead: (conversationId) => api.patch(`/customer/messages/${conversationId}/read`),
  replyToMessage: (conversationId, messageData) => api.post(`/customer/messages/${conversationId}/reply`, messageData)
};

// Legacy support
export const getComboEvents = (params) => comboAPI.getAllCombos(params);
export const createComboEvent = (formData) => comboAPI.createCombo(formData);

export default api;