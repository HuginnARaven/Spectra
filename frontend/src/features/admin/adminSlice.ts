import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from './adminApi';
import type {
    AdminUserListItem,
    AdminUserRequest,
    AdminUrlListItem,
    AdminUrlRequest,
    SubscriptionPlan,
    CreateSubscriptionPlanRequest,
    UpdateSubscriptionPlanRequest,
    CreateSubscriptionPriceRequest,
    UpdateSubscriptionPriceRequest,
    AdminPaginatedUsersQuery,
    AdminPaginatedUrlsQuery,
    Role,
} from './types';

export interface AdminState {
    // Users
    users: AdminUserListItem[];
    usersTotalCount: number;
    selectedUser: AdminUserListItem | null;
    isUsersLoading: boolean;

    // URLs
    urls: AdminUrlListItem[];
    urlsTotalCount: number;
    selectedUrl: AdminUrlListItem | null;
    isUrlsLoading: boolean;

    // Subscription Plans
    subscriptionPlans: SubscriptionPlan[];
    selectedPlan: SubscriptionPlan | null;
    isPlansLoading: boolean;

    // Roles
    roles: Role[];
    isRolesLoading: boolean;

    // General status
    isLoading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    users: [],
    usersTotalCount: 0,
    selectedUser: null,
    isUsersLoading: false,

    urls: [],
    urlsTotalCount: 0,
    selectedUrl: null,
    isUrlsLoading: false,

    subscriptionPlans: [],
    selectedPlan: null,
    isPlansLoading: false,

    roles: [],
    isRolesLoading: false,

    isLoading: false,
    error: null,
};

// User Thunks

export const fetchAdminUsers = createAsyncThunk(
    'admin/fetchUsers',
    async (
        query: AdminPaginatedUsersQuery = { pageNumber: 1, pageSize: 10 },
        { rejectWithValue }
    ) => {
        try {
            return await adminApi.getUsers(query);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to fetch users'
            );
        }
    }
);

export const fetchAdminUserById = createAsyncThunk(
    'admin/fetchUserById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await adminApi.getUserById(id);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to fetch user'
            );
        }
    }
);

export const editAdminUser = createAsyncThunk(
    'admin/editUser',
    async ({ id, data }: { id: string; data: AdminUserRequest }, { rejectWithValue }) => {
        try {
            return await adminApi.editUser(id, data);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to edit user'
            );
        }
    }
);

export const deleteAdminUser = createAsyncThunk(
    'admin/deleteUser',
    async (id: string, { rejectWithValue }) => {
        try {
            await adminApi.deleteUser(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to delete user'
            );
        }
    }
);


// Role Thunks
export const fetchAdminRoles = createAsyncThunk(
    'admin/fetchRoles',
    async (_, { rejectWithValue }) => {
        try {
            return await adminApi.getRoles();
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to fetch roles'
            );
        }
    }
);

// URL Thunks
export const fetchAdminUrls = createAsyncThunk(
    'admin/fetchUrls',
    async (
        query: AdminPaginatedUrlsQuery = { pageNumber: 1, pageSize: 10 },
        { rejectWithValue }
    ) => {
        try {


            return await adminApi.getUrls(query);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to fetch URLs'
            );
        }
    }
);

export const fetchAdminUrlById = createAsyncThunk(
    'admin/fetchUrlById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await adminApi.getUrlById(id);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to fetch URL'
            );
        }
    }
);

export const createAdminUrl = createAsyncThunk(
    'admin/createUrl',
    async (data: AdminUrlRequest, { rejectWithValue }) => {
        try {
            return await adminApi.createUrl(data);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to create URL'
            );
        }
    }
);

export const editAdminUrl = createAsyncThunk(
    'admin/editUrl',
    async ({ id, data }: { id: string; data: AdminUrlRequest }, { rejectWithValue }) => {
        try {
            return await adminApi.editUrl(id, data);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to edit URL'
            );
        }
    }
);

export const deleteAdminUrl = createAsyncThunk(
    'admin/deleteUrl',
    async (id: string, { rejectWithValue }) => {
        try {
            await adminApi.deleteUrl(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to delete URL'
            );
        }
    }
);

// Subscription Plan Thunks
export const fetchAdminSubscriptionPlans = createAsyncThunk(
    'admin/fetchSubscriptionPlans',
    async (_, { rejectWithValue }) => {
        try {
            return await adminApi.getSubscriptionPlans();
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to fetch subscription plans'
            );
        }
    }
);

export const fetchAdminSubscriptionPlanById = createAsyncThunk(
    'admin/fetchSubscriptionPlanById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await adminApi.getSubscriptionPlanById(id);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to fetch subscription plan'
            );
        }
    }
);

export const createAdminSubscriptionPlan = createAsyncThunk(
    'admin/createSubscriptionPlan',
    async (data: CreateSubscriptionPlanRequest, { dispatch, rejectWithValue }) => {
        try {
            await adminApi.createSubscriptionPlan(data);
            await dispatch(fetchAdminSubscriptionPlans());
            return;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to create subscription plan'
            );
        }
    }
);

export const updateAdminSubscriptionPlan = createAsyncThunk(
    'admin/updateSubscriptionPlan',
    async ({ id, data }: { id: string; data: UpdateSubscriptionPlanRequest }, { dispatch, rejectWithValue }) => {
        try {
            await adminApi.updateSubscriptionPlan(id, data);
            await dispatch(fetchAdminSubscriptionPlans());
            return { id, data };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to update subscription plan'
            );
        }
    }
);

export const deleteAdminSubscriptionPlan = createAsyncThunk(
    'admin/deleteSubscriptionPlan',
    async (id: string, { rejectWithValue }) => {
        try {
            await adminApi.deleteSubscriptionPlan(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to delete subscription plan'
            );
        }
    }
);

export const addPriceToAdminSubscriptionPlan = createAsyncThunk(
    'admin/addPriceToSubscriptionPlan',
    async ({ planId, data }: { planId: string; data: CreateSubscriptionPriceRequest }, { dispatch, rejectWithValue }) => {
        try {
            await adminApi.addPriceToPlan(planId, data);
            await dispatch(fetchAdminSubscriptionPlans());
            return { planId, data };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to add price to subscription plan'
            );
        }
    }
);

export const updateAdminSubscriptionPrice = createAsyncThunk(
    'admin/updateSubscriptionPrice',
    async ({ id, data }: { id: string; data: UpdateSubscriptionPriceRequest }, { dispatch, rejectWithValue }) => {
        try {
            await adminApi.updateSubscriptionPrice(id, data);
            await dispatch(fetchAdminSubscriptionPlans());
            return { id, data };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.Message ||
                'Failed to update subscription price'
            );
        }
    }
);


const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        setSelectedUrl: (state, action) => {
            state.selectedUrl = action.payload;
        },
        setSelectedPlan: (state, action) => {
            state.selectedPlan = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchAdminUsers.pending, (state) => {
                state.isLoading = true;
                state.isUsersLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isUsersLoading = false;
                state.users = action.payload.items;
                state.usersTotalCount = action.payload.totalCount;
            })
            .addCase(fetchAdminUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.isUsersLoading = false;
                state.error = action.payload as string;
            })

            // Fetch User By Id
            .addCase(fetchAdminUserById.pending, (state) => {
                state.isLoading = true;
                state.isUsersLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isUsersLoading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchAdminUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.isUsersLoading = false;
                state.error = action.payload as string;
            })

            // Edit User
            .addCase(editAdminUser.pending, (state) => {
                state.isLoading = true;
                //state.isUsersLoading = true;
                state.error = null;
            })
            .addCase(editAdminUser.fulfilled, (state, action) => {
                state.isLoading = false;
                //state.isUsersLoading = false;
                const index = state.users.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser = action.payload;
                }
            })
            .addCase(editAdminUser.rejected, (state, action) => {
                state.isLoading = false;
                //state.isUsersLoading = false;
                state.error = action.payload as string;
            })

            // Delete User
            .addCase(deleteAdminUser.pending, (state) => {
                state.isLoading = true;
                //state.isUsersLoading = true;
                state.error = null;
            })
            .addCase(deleteAdminUser.fulfilled, (state, action) => {
                state.isLoading = false;
                //state.isUsersLoading = false;
                state.users = state.users.filter((u) => u.id !== action.payload);
                state.usersTotalCount = Math.max(0, state.usersTotalCount - 1);
                if (state.selectedUser?.id === action.payload) {
                    state.selectedUser = null;
                }
            })
            .addCase(deleteAdminUser.rejected, (state, action) => {
                state.isLoading = false;
                //state.isUsersLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Roles
            .addCase(fetchAdminRoles.pending, (state) => {
                state.isRolesLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminRoles.fulfilled, (state, action) => {
                state.isRolesLoading = false;
                state.roles = action.payload;
            })
            .addCase(fetchAdminRoles.rejected, (state, action) => {
                state.isRolesLoading = false;
                state.error = action.payload as string;
            })

            // Fetch URLs
            .addCase(fetchAdminUrls.pending, (state) => {
                state.isLoading = true;
                state.isUrlsLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminUrls.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isUrlsLoading = false;
                state.urls = action.payload.items;
                state.urlsTotalCount = action.payload.totalCount;
            })
            .addCase(fetchAdminUrls.rejected, (state, action) => {
                state.isLoading = false;
                state.isUrlsLoading = false;
                state.error = action.payload as string;
            })

            // Fetch URL By Id
            .addCase(fetchAdminUrlById.pending, (state) => {
                state.isLoading = true;
                state.isUrlsLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminUrlById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isUrlsLoading = false;
                state.selectedUrl = action.payload;
            })
            .addCase(fetchAdminUrlById.rejected, (state, action) => {
                state.isLoading = false;
                state.isUrlsLoading = false;
                state.error = action.payload as string;
            })

            // Create URL
            .addCase(createAdminUrl.pending, (state) => {
                state.isLoading = true;
                state.isUrlsLoading = true;
                state.error = null;
            })
            .addCase(createAdminUrl.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isUrlsLoading = false;
                state.urls.unshift(action.payload);
                state.urlsTotalCount += 1;
            })
            .addCase(createAdminUrl.rejected, (state, action) => {
                state.isLoading = false;
                state.isUrlsLoading = false;
                state.error = action.payload as string;
            })

            // Edit URL
            .addCase(editAdminUrl.pending, (state) => {
                state.isLoading = true;
                state.isUrlsLoading = true;
                state.error = null;
            })
            .addCase(editAdminUrl.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isUrlsLoading = false;
                const index = state.urls.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.urls[index] = action.payload;
                }
                if (state.selectedUrl?.id === action.payload.id) {
                    state.selectedUrl = action.payload;
                }
            })
            .addCase(editAdminUrl.rejected, (state, action) => {
                state.isLoading = false;
                state.isUrlsLoading = false;
                state.error = action.payload as string;
            })

            // Delete URL
            .addCase(deleteAdminUrl.pending, (state) => {
                state.isLoading = true;
                state.isUrlsLoading = true;
                state.error = null;
            })
            .addCase(deleteAdminUrl.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isUrlsLoading = false;
                state.urls = state.urls.filter((u) => u.id !== action.payload);
                state.urlsTotalCount = Math.max(0, state.urlsTotalCount - 1);
                if (state.selectedUrl?.id === action.payload) {
                    state.selectedUrl = null;
                }
            })
            .addCase(deleteAdminUrl.rejected, (state, action) => {
                state.isLoading = false;
                state.isUrlsLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Subscription Plans
            .addCase(fetchAdminSubscriptionPlans.pending, (state) => {
                state.isLoading = true;
                state.isPlansLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminSubscriptionPlans.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isPlansLoading = false;
                state.subscriptionPlans = action.payload;
            })
            .addCase(fetchAdminSubscriptionPlans.rejected, (state, action) => {
                state.isLoading = false;
                state.isPlansLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Subscription Plan By Id
            .addCase(fetchAdminSubscriptionPlanById.pending, (state) => {
                state.isLoading = true;
                state.isPlansLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminSubscriptionPlanById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isPlansLoading = false;
                state.selectedPlan = action.payload;
            })
            .addCase(fetchAdminSubscriptionPlanById.rejected, (state, action) => {
                state.isLoading = false;
                state.isPlansLoading = false;
                state.error = action.payload as string;
            })

            // Create Subscription Plan
            .addCase(createAdminSubscriptionPlan.pending, (state) => {
                state.isLoading = true;
                state.isPlansLoading = true;
                state.error = null;
            })
            .addCase(createAdminSubscriptionPlan.fulfilled, (state) => {
                state.isLoading = false;
                state.isPlansLoading = false;
            })
            .addCase(createAdminSubscriptionPlan.rejected, (state, action) => {
                state.isLoading = false;
                state.isPlansLoading = false;
                state.error = action.payload as string;
            })

            // Update Subscription Plan
            .addCase(updateAdminSubscriptionPlan.pending, (state) => {
                state.isLoading = true;
                state.isPlansLoading = true;
                state.error = null;
            })
            .addCase(updateAdminSubscriptionPlan.fulfilled, (state) => {
                state.isLoading = false;
                state.isPlansLoading = false;
            })
            .addCase(updateAdminSubscriptionPlan.rejected, (state, action) => {
                state.isLoading = false;
                state.isPlansLoading = false;
                state.error = action.payload as string;
            })

            // Delete Subscription Plan
            .addCase(deleteAdminSubscriptionPlan.pending, (state) => {
                state.isLoading = true;
                state.isPlansLoading = true;
                state.error = null;
            })
            .addCase(deleteAdminSubscriptionPlan.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isPlansLoading = false;
                state.subscriptionPlans = state.subscriptionPlans.filter((p) => p.id !== action.payload);
                if (state.selectedPlan?.id === action.payload) {
                    state.selectedPlan = null;
                }
            })
            .addCase(deleteAdminSubscriptionPlan.rejected, (state, action) => {
                state.isLoading = false;
                state.isPlansLoading = false;
                state.error = action.payload as string;
            })

            // Add Price
            .addCase(addPriceToAdminSubscriptionPlan.pending, (state) => {
                state.isLoading = true;
                state.isPlansLoading = true;
                state.error = null;
            })
            .addCase(addPriceToAdminSubscriptionPlan.fulfilled, (state) => {
                state.isLoading = false;
                state.isPlansLoading = false;
            })
            .addCase(addPriceToAdminSubscriptionPlan.rejected, (state, action) => {
                state.isLoading = false;
                state.isPlansLoading = false;
                state.error = action.payload as string;
            })

            // Update Price
            .addCase(updateAdminSubscriptionPrice.pending, (state) => {
                state.isLoading = true;
                state.isPlansLoading = true;
                state.error = null;
            })
            .addCase(updateAdminSubscriptionPrice.fulfilled, (state) => {
                state.isLoading = false;
                state.isPlansLoading = false;
            })
            .addCase(updateAdminSubscriptionPrice.rejected, (state, action) => {
                state.isLoading = false;
                state.isPlansLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearErrors, setSelectedUser, setSelectedUrl, setSelectedPlan } = adminSlice.actions;

export default adminSlice.reducer;
