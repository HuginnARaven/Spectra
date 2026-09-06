import agent from '@/api/agent';
import type {LoginRequest, RegisterRequest, AuthResponse, User, GoogleAuthRequest, ResetPasswordRequest} from './types';

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
    },
    
   loginViaGoogle: async (data: GoogleAuthRequest) => {
       const response = await agent.post<AuthResponse>('/auth/google-login', data);
       return response.data;
    },

    sendForgotPasswordLetter: async (email: string)=> {
        const response = await agent.post(`/auth/send-forgot-password-letter`, {email: email});
        return response.data;
    },

    resetPassword: async (data: ResetPasswordRequest) => {
        const response = await agent.post('/auth/reset-password', data);
        return response.data;
    },
};

export default authApi;