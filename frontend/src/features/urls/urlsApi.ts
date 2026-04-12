import agent from '@/api/agent';
import type {UrlData} from './types';

interface CreateUrlRequest {
    originalUrl: string;
}

export const urlsApi = {
    getUserUrls: async () => {
        const response = await agent.get<UrlData[]>('/urls/get-shorten-urls');
        return response.data;
    },
    createUrl: async (data: CreateUrlRequest) => {
        const response = await agent.post<UrlData>('/urls/create-shorten-url', data);
        return response.data;
    },
    deleteUrl: async (id: string) => {
        const response = await agent.delete(`/urls/delete-shorten-url/${id}`);
        return response.data;
    }
};
