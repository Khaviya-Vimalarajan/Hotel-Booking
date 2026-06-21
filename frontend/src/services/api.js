import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT access token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
      config.headers['Authorization'] = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 Unauthorized and not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.refreshToken) {
          // Request new access token using refresh token
          const res = await axios.post('http://localhost:8080/api/auth/refresh', {
            refreshToken: user.refreshToken,
          });
          
          if (res.status === 200) {
            // Update local storage
            const updatedUser = {
              ...user,
              accessToken: res.data.accessToken,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Retry the original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token expired or invalid, log out user
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
