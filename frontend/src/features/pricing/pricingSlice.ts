import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type {SubscriptionPlan, CheckoutRequest} from './types';
import pricingApi from './pricingApi';

interface PricingState {
    plans: SubscriptionPlan[];
    isLoading: boolean;
    isCheckingOut: boolean;
    checkoutPriceId: string | null;
    error: string | null;
}

const initialState: PricingState = {
    plans: [],
    isLoading: false,
    isCheckingOut: false,
    checkoutPriceId: null,
    error: null,
};

export const fetchSubscriptionPlans = createAsyncThunk(
    'pricing/fetchSubscriptionPlans',
    async (_, {rejectWithValue}) => {
        try {
            return await pricingApi.getSubscriptionPlans();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to load subscription plans');
        }
    }
);

export const createCheckoutSession = createAsyncThunk(
    'pricing/createCheckoutSession',
    async (request: CheckoutRequest, {rejectWithValue}) => {
        try {
            return await pricingApi.createCheckoutSession(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.Message || 'Failed to create checkout session');
        }
    }
);

const pricingSlice = createSlice({
    name: 'pricing',
    initialState,
    reducers: {
        clearPricingError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Plans
            .addCase(fetchSubscriptionPlans.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload && action.payload.length > 0) {
                    state.plans = action.payload;
                }
            })
            .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Checkout Session
            .addCase(createCheckoutSession.pending, (state, action) => {
                state.isCheckingOut = true;
                state.checkoutPriceId = action.meta.arg.priceId;
                state.error = null;
            })
            .addCase(createCheckoutSession.fulfilled, (state) => {
                state.isCheckingOut = false;
                state.checkoutPriceId = null;
            })
            .addCase(createCheckoutSession.rejected, (state, action) => {
                state.isCheckingOut = false;
                state.checkoutPriceId = null;
                state.error = action.payload as string;
            });
    },
});

export const {clearPricingError} = pricingSlice.actions;
export default pricingSlice.reducer;
