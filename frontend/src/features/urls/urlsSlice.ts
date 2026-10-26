import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { urlsApi } from './urlsApi';
import type {CreateUrlRequest, UrlData} from './types';

interface UrlsState {
    urls: UrlData[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: UrlsState = {
    urls: [],
    totalCount: 0,
    isLoading: false,
    error: null,
};

export const fetchUrls = createAsyncThunk(
    'urls/fetchUrls',
    async ({page, pageSize}: {page: number, pageSize: number}, { rejectWithValue }) => {
        try {
            return await urlsApi.getUserUrls(page, pageSize);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch URLs');
        }
    }
);

export const createUrl = createAsyncThunk(
    'urls/createUrl',
    async (request: CreateUrlRequest, { rejectWithValue }) => {
        try {
            return await urlsApi.createUrl(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create URL');
        }
    }
);

export const createTemporaryUrl = createAsyncThunk(
    'urls/createTemporaryUrl',
    async (request: CreateUrlRequest, { rejectWithValue }) => {
        try {
            return await urlsApi.createTemporaryUrl(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create temporary URL');
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
                state.urls = action.payload.items;
                state.totalCount = action.payload.totalCount;
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
