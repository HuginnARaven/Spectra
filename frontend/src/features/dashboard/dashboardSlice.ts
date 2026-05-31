import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from './dashboardApi';
import type { UrlVisitData } from '@/features/analytics/types';

interface DashboardState {
    allVisits: UrlVisitData[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    allVisits: [],
    totalCount: 0,
    isLoading: false,
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
            });
    },
});

export default dashboardSlice.reducer;
