import axios from 'axios';

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5199/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = accessToken || localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            accessToken = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
