import agent from '@/api/agent';
import type {ProfileRequest, User, ChangePasswordRequest, SetPasswordRequest} from './types';

const accountApi = {
    getCurrentUser: async () => {
        const response = await agent.get<User>(`/account/profile`);
        return response.data;
    },
    editUser: async (data: ProfileRequest) => {
        const response = await agent.put<User>(`/account/edit-profile`, data);
        return response.data;
    },
    changePassword: async (data: ChangePasswordRequest) => {
        const response = await agent.post(`/account/change-password`, data);
        return response.data;
    },
    setPassword: async (data: SetPasswordRequest)=> {
        const response = await agent.post(`/account/set-password`, data);
        return response.data;
    }
};

export default accountApi;