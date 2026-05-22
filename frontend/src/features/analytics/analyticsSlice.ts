import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsApi } from './analyticsApi';
import type {UrlAnalyticsData, UrlVisitData} from './types';

interface UrlsAnalyticsState {
    urlVisits: UrlVisitData[];
    totalCount: number;
    urlAnalyticsData: UrlAnalyticsData;
    isLoading: boolean;
    isAnalyticsLoading: boolean;
    error: string | null;
}

const initialState: UrlsAnalyticsState = {
    urlVisits: [],
    totalCount: 0,
    urlAnalyticsData: {
        totalVisits: 0,
        topCountries: [],
        deviceDistribution: [],
        last30DaysVisits: [],
    },
    isLoading: false,
    isAnalyticsLoading: false,
    error: null,
};

export const fetchUrlVisits = createAsyncThunk(
    'analytics/fetchUrlVisits',
    async ({id, page, pageSize}: {id: string, page: number, pageSize: number}, { rejectWithValue }) => {
        try {
            return await analyticsApi.getUrlVisits(id, page, pageSize);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch URLs');
        }
    }
);

export const fetchUrlAnalytics = createAsyncThunk(
    'analytics/fetchUrlAnalytics',
    async (id: string, { rejectWithValue }) => {
        try {
            return await analyticsApi.getUrlAnalytics(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
        }
    }
);

const analyticsSlice = createSlice({
    name: 'urls',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Visits
            .addCase(fetchUrlVisits.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUrlVisits.fulfilled, (state, action) => {
                state.isLoading = false;
                state.urlVisits = action.payload.items;
                state.totalCount = action.payload.totalCount;
            })
            .addCase(fetchUrlVisits.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Analytics
            .addCase(fetchUrlAnalytics.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUrlAnalytics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.urlAnalyticsData = action.payload;
            })
            .addCase(fetchUrlAnalytics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
    },
});

export default analyticsSlice.reducer;
