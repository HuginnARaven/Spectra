import axios from 'axios';

const agent = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

agent.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

agent.interceptors.response.use(
    (response) => response,
    async (error) => {
        return Promise.reject(error);
    }
);

export default agent;