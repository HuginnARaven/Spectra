import agent from '@/api/agent';
import type { UrlVisitData } from '@/features/analytics/types';
import type {TrendAnalytics} from "@/features/dashboard/types.ts";

export const dashboardApi = {
    getAllVisits: async (pageNumber: number = 1, pageSize: number = 100) => {
        const response = await agent.get<{ items: UrlVisitData[], totalCount: number, pageNumber: number, pageSize: number}>(
            '/urls/get-all-visits', 
            { params: { pageNumber, pageSize } }
        );
        return response.data;
    },
    getTrendAnalytics: async () => {
        const response = await agent.get<TrendAnalytics>(`/urls/get-trend-analytics`);
        return response.data;
    }
};

export default dashboardApi;
