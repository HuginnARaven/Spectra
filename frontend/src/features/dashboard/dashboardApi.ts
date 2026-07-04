import agent from '@/api/agent';
import type { UrlVisitData } from '@/features/analytics/types';
import type {DevicesDailyVisitsData, TrendAnalytics} from "@/features/dashboard/types.ts";

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
    },
    getDevicesDailyVisits: async () => {
        const response = await agent.get<DevicesDailyVisitsData[]>(`/urls/get-devices-visits-by-days`);
        return response.data;
    }
};

export default dashboardApi;
