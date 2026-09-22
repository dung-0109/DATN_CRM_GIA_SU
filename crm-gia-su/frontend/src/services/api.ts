import axios from 'axios';
import { getTokenForPath } from './sessionStore';

const api = axios.create({
  baseURL: 'http://localhost:3000', // API Server base
});

// Tự động gắn Authorization token theo CỔNG hiện tại (mỗi portal một phiên riêng)
api.interceptors.request.use((config) => {
  const token = getTokenForPath();
  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
