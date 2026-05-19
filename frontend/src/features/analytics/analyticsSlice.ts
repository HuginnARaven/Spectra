import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsApi } from './analyticsApi';
import type {UrlVisitData} from './types';

interface UrlsAnalyticsState {
    urlVisits: UrlVisitData[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: UrlsAnalyticsState = {
    urlVisits: [],
    totalCount: 0,
    isLoading: false,
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
    },
});

export default analyticsSlice.reducer;
