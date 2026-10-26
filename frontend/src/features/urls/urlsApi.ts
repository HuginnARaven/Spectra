import agent from '@/api/agent';
import type {CreateUrlRequest, UrlData} from './types';


export const urlsApi = {
    getUserUrls: async (pageNumber: number = 1, pageSize: number = 100) => {
        const response = await agent.get<{ items: UrlData[], totalCount: number, pageNumber: number, pageSize: number}>(
            '/urls/get-shorten-urls',
            { params: { pageNumber, pageSize } });
        return response.data;
    },
    createUrl: async (data: CreateUrlRequest) => {
        const response = await agent.post<UrlData>('/urls/create-shorten-url', data);
        return response.data;
    },
    createTemporaryUrl: async (data: CreateUrlRequest) => {
        const response = await agent.post<string>('/urls/create-temporary-url', data);
        return response.data;
    },
    deleteUrl: async (id: string) => {
        const response = await agent.delete(`/urls/delete-shorten-url/${id}`);
        return response.data;
    }
};
