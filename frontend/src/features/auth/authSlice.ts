/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User, LoginRequest, RegisterRequest } from './types';
import authApi from './authApi';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const token = localStorage.getItem('accessToken');

const initialState: AuthState = {
    user: null,
    token: token,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
};

// --- Async Thunks ---

export const loginUser = createAsyncThunk(
    'auth/login',
    async (data: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.login(data);

            localStorage.setItem('accessToken', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);

            const user = await authApi.getCurrentUser();

            return { token: response.token, user };
        }
        catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (data: RegisterRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.register(data);

            localStorage.setItem('accessToken', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);

            const user = await authApi.getCurrentUser();

            return { token: response.token, user };
        }
        catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            const user = await authApi.getCurrentUser();
            return user;
        }
        catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load user profile');
        }
    }
);

// --- Slice ---

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('accessToken');
        },
        clearErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })

            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Load User
            .addCase(loadUser.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(loadUser.rejected, (state) => {
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
                localStorage.removeItem('accessToken');
            });
    },
});

export const { logout, clearErrors } = authSlice.actions;
export default authSlice.reducer;