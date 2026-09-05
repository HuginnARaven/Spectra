import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type {ChangePasswordRequest, ProfileRequest, SetPasswordRequest, User,} from './types';
import accountApi from './accountApi';
import {loginUser, logout, registerUser} from "@/features/auth/authSlice.ts";


interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
};


export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, {rejectWithValue}) => {
        try {
            return await accountApi.getCurrentUser();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to load user profile');
        }
    }
);

export const editUser = createAsyncThunk(
    'account/editUser',
    async (data: ProfileRequest, {rejectWithValue}) => {
        try {
            await accountApi.editUser(data);
            return data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to edit user profile');
        }
    }
);

export const changePassword = createAsyncThunk(
    'account/changePassword',
    async (data: ChangePasswordRequest, {rejectWithValue}) => {
        try {
            await accountApi.changePassword(data);
            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to change password');
        }
    }
);

export const setPassword = createAsyncThunk(
    'account/setPassword',
    async (data: SetPasswordRequest, {rejectWithValue}) => {
        try {
            await accountApi.setPassword(data);
            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to set password');
        }
    }
);

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(loadUser.rejected, (state) => {
                state.user = null;
                state.isLoading = false;
            })
            
            .addCase(editUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(editUser.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.user!.email !== action.payload.email) {
                    state.user!.emailConfirmed = false;
                }
                state.user!.email = action.payload.email;
                state.user!.username = action.payload.username;
                state.user!.displayName = action.payload.displayName;
            })
            .addCase(editUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            
            .addCase(changePassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(setPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(setPassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(setPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            
            // Auth
            .addCase(logout, (state) => {
                state.user = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
            })
    },
});

export const {clearErrors} = accountSlice.actions;
export default accountSlice.reducer;