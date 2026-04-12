import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { urlsApi } from './urlsApi';
import type {UrlData} from './types';

interface UrlsState {
    urls: UrlData[];
    isLoading: boolean;
    error: string | null;
}

const initialState: UrlsState = {
    urls: [],
    isLoading: false,
    error: null,
};

export const fetchUrls = createAsyncThunk(
    'urls/fetchUrls',
    async (_, { rejectWithValue }) => {
        try {
            return await urlsApi.getUserUrls();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch URLs');
        }
    }
);

export const createUrl = createAsyncThunk(
    'urls/createUrl',
    async (originalUrl: string, { rejectWithValue }) => {
        try {
            return await urlsApi.createUrl({ originalUrl });
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create URL');
        }
    }
);

export const deleteUrl = createAsyncThunk(
    'urls/deleteUrl',
    async (id: string, { rejectWithValue }) => {
        try {
            await urlsApi.deleteUrl(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete URL');
        }
    }
);

const urlsSlice = createSlice({
    name: 'urls',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch URLs
            .addCase(fetchUrls.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUrls.fulfilled, (state, action) => {
                state.isLoading = false;
                state.urls = action.payload;
            })
            .addCase(fetchUrls.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create URL
            .addCase(createUrl.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createUrl.fulfilled, (state, action) => {
                state.isLoading = false;
                state.urls.unshift(action.payload);
            })
            .addCase(createUrl.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete URL
            .addCase(deleteUrl.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteUrl.fulfilled, (state, action) => {
                state.urls = state.urls.filter(url => url.id !== action.payload);
            })
            .addCase(deleteUrl.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export default urlsSlice.reducer;
