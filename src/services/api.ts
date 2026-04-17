import axios from 'axios';

const api = axios.create({
    baseURL: process.env.API_URL || 'http://192.168.15.100:8080',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            console.warn('Sessão expirada ou não autorizada. Redirecionando para login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            globalThis.location.href = '/login';
        }
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        return Promise.reject(error);
    }
);

export default api;