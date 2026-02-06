import agent from '@/api/agent';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from './types';

const authApi = {
    login: async (data: LoginRequest) => {
        const response = await agent.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest) => {
        const response = await agent.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await agent.get<User>(`/account/profile`);
        return response.data;
    }
};

export default authApi;