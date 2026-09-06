import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {GoogleAuthRequest, LoginRequest, RegisterRequest} from './types';
import authApi from './authApi';
import {loadUser} from "@/features/account/accountSlice.ts";

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const token = localStorage.getItem('accessToken');

const initialState: AuthState = {
    token: token,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    'auth/login',
    async (data: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.login(data);

            localStorage.setItem('accessToken', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            return response;
        }
        catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const loginUserViaGoogle = createAsyncThunk(
    'auth/google-login',
    async (data: GoogleAuthRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.loginViaGoogle(data);

            localStorage.setItem('accessToken', response.token); 
            localStorage.setItem('refreshToken', response.refreshToken);

            return response;
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

            return response;
        }
        catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Registration failed');
        }
    }
);

export const sendForgotPassword = createAsyncThunk(
    'auth/sendEmailVerification',
    async (email: string, {rejectWithValue}) => {
        try {
            await authApi.sendForgotPasswordLetter(email);
            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to send email');
        }
    }
);


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
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
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })

            // Google Login
            .addCase(loginUserViaGoogle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUserViaGoogle.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
            })
            .addCase(loginUserViaGoogle.rejected, (state, action) => {
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
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(sendForgotPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(sendForgotPassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(sendForgotPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Account
            .addCase(loadUser.rejected, (state) => {
                state.isAuthenticated = false;
                state.token = null;
                localStorage.removeItem('accessToken');
            });
    },
});

export const { logout, clearErrors } = authSlice.actions;
export default authSlice.reducer;