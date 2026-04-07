import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://smartfix-backend.onrender.com/api',
    timeout: 30000 // Reduced timeout from 100s to 30s to fail fast
});

// Centralized error handling interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Return successful response as-is
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized globally
            if (error.response.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // You can dispatch a logout action here if you inject the store, 
                // but window redirect is a simple non-cyclic way.
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;