import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Match backend C# API port
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthenticated state here if needed
            if (typeof window !== 'undefined') {
                // Optionally redirect to login or clear token
                // localStorage.removeItem('token');
            }
        }
        return Promise.reject(error);
    }
);

export default api;