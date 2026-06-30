import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from './dashboardApi';
import type { UrlVisitData } from '@/features/analytics/types';
import type {TrendAnalytics} from "@/features/dashboard/types.ts";

interface DashboardState {
    allVisits: UrlVisitData[];
    trendAnalytics: TrendAnalytics
    totalCount: number;
    isLoading: boolean;
    isTrendAnalyticsLoading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    allVisits: [],
    trendAnalytics: {
        visits: {
            value: 0,
            trendPercentage: 0
        },
        devices: [],
        countries: [],
        referrers: []
    },
    totalCount: 0,
    isLoading: false,
    isTrendAnalyticsLoading: false,
    error: null,
};

export const fetchAllVisits = createAsyncThunk(
    'dashboard/fetchAllVisits',
    async ({page, pageSize}: {page: number, pageSize: number}, { rejectWithValue }) => {
        try {
            return await dashboardApi.getAllVisits(page, pageSize);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch all visits');
        }
    }
);

export const fetchTrendAnalytics = createAsyncThunk(
    'dashboard/fetchTrendAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            return await dashboardApi.getTrendAnalytics();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch trend analytics');
        }
    }
);


const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllVisits.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllVisits.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allVisits = action.payload.items;
                state.totalCount = action.payload.totalCount;
            })
            .addCase(fetchAllVisits.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchTrendAnalytics.pending, (state) => {
                state.isTrendAnalyticsLoading = true;
                state.error = null;
            })
            .addCase(fetchTrendAnalytics.fulfilled, (state, action) => {
                state.isTrendAnalyticsLoading = false;
                state.trendAnalytics = action.payload;
            })
            .addCase(fetchTrendAnalytics.rejected, (state, action) => {
                state.isTrendAnalyticsLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default dashboardSlice.reducer;
