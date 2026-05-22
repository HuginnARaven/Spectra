import agent from '@/api/agent';
import type {UrlVisitData} from './types';

export const analyticsApi = {
    getUrlVisits: async (urlId: string, pageNumber: number = 1, pageSize: number = 100) => {
        const response = await agent.get<{ items: UrlVisitData[], totalCount: number, pageNumber: number, pageSize: number}>(
            `/urls/get-url-visits/${urlId}`, 
            { params: { pageNumber, pageSize } }
        );
        return response.data;
    },
    getUrlAnalytics: async (urlId: string) => {
        const response = await agent.get<any>(`/urls/get-url-analytics/${urlId}`);
        return response.data;
    }
};

export default analyticsApi;
