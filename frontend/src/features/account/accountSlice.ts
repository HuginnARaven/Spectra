import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type {
    ChangePasswordRequest,
    ProfileRequest,
    SetPasswordRequest,
    User,
    UserSubscription,
    CancelSubscriptionRequest,
    ChangePlanRequest,
} from './types';
import accountApi from './accountApi';
import subscriptionApi from './subscriptionApi';
import {loginUser, logout, registerUser} from "@/features/auth/authSlice.ts";


interface AuthState {
    user: User | null;
    subscription: UserSubscription | null;
    isLoading: boolean;
    isSubscriptionLoading: boolean;
    error: string | null;
    subscriptionError: string | null;
}

const initialState: AuthState = {
    user: null,
    subscription: null,
    isLoading: false,
    isSubscriptionLoading: false,
    error: null,
    subscriptionError: null,
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

export const sendEmailVerification = createAsyncThunk(
    'account/sendEmailVerification',
    async (_, {rejectWithValue}) => {
        try {
            await accountApi.sendEmailVerificationLetter();
            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to send email');
        }
    }
);

export const loadSubscription = createAsyncThunk(
    'account/loadSubscription',
    async (_, {rejectWithValue}) => {
        try {
            return await subscriptionApi.getSubscription();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to load subscription');
        }
    }
);

export const cancelSubscription = createAsyncThunk(
    'account/cancelSubscription',
    async (request: CancelSubscriptionRequest = { immediate: false }, {rejectWithValue}) => {
        try {
            await subscriptionApi.cancelSubscription(request);
            return request;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to cancel subscription');
        }
    }
);

export const resumeSubscription = createAsyncThunk(
    'account/resumeSubscription',
    async (_, {rejectWithValue}) => {
        try {
            await subscriptionApi.resumeSubscription();
            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to resume subscription');
        }
    }
);

export const changePlan = createAsyncThunk(
    'account/changePlan',
    async (request: ChangePlanRequest, {dispatch, rejectWithValue}) => {
        try {
            await subscriptionApi.changePlan(request);
            await dispatch(loadSubscription());
            await dispatch(loadUser());
            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to change plan');
        }
    }
);

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
            state.subscriptionError = null;
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

            .addCase(sendEmailVerification.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(sendEmailVerification.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(sendEmailVerification.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            
            // Subscriptions
            .addCase(loadSubscription.pending, (state) => {
                state.isSubscriptionLoading = true;
                state.subscriptionError = null;
            })
            .addCase(loadSubscription.fulfilled, (state, action) => {
                state.isSubscriptionLoading = false;
                state.subscription = action.payload;
            })
            .addCase(loadSubscription.rejected, (state, action) => {
                state.isSubscriptionLoading = false;
                state.subscription = null;
                state.subscriptionError = action.payload as string;
            })

            .addCase(cancelSubscription.pending, (state) => {
                state.isSubscriptionLoading = true;
                state.subscriptionError = null;
            })
            .addCase(cancelSubscription.fulfilled, (state, action) => {
                state.isSubscriptionLoading = false;
                if (state.subscription) {
                    if (action.payload?.immediate) {
                        state.subscription.status = 'Canceled';
                        state.subscription.cancelAtPeriodEnd = false;
                    } else {
                        state.subscription.cancelAtPeriodEnd = true;
                    }
                    state.subscription.canceledAt = new Date().toISOString();
                }
            })
            .addCase(cancelSubscription.rejected, (state, action) => {
                state.isSubscriptionLoading = false;
                state.subscriptionError = action.payload as string;
            })

            .addCase(resumeSubscription.pending, (state) => {
                state.isSubscriptionLoading = true;
                state.subscriptionError = null;
            })
            .addCase(resumeSubscription.fulfilled, (state) => {
                state.isSubscriptionLoading = false;
                if (state.subscription) {
                    state.subscription.cancelAtPeriodEnd = false;
                    state.subscription.canceledAt = null;
                }
            })
            .addCase(resumeSubscription.rejected, (state, action) => {
                state.isSubscriptionLoading = false;
                state.subscriptionError = action.payload as string;
            })

            .addCase(changePlan.pending, (state) => {
                state.isSubscriptionLoading = true;
                state.subscriptionError = null;
            })
            .addCase(changePlan.fulfilled, (state) => {
                state.isSubscriptionLoading = false;
            })
            .addCase(changePlan.rejected, (state, action) => {
                state.isSubscriptionLoading = false;
                state.subscriptionError = action.payload as string;
            })

            // Auth
            .addCase(logout, (state) => {
                state.user = null;
                state.subscription = null;
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
