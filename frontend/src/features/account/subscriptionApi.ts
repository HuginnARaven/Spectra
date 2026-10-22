import agent from '@/api/agent';
import type { CheckoutRequest, CheckoutResponse } from '@/features/pricing/types';
import type {
    CancelSubscriptionRequest,
    ChangePlanRequest,
    UserSubscription,
} from './types';

const subscriptionApi = {
    getSubscription: async () => {
        const response = await agent.get<UserSubscription | null>('/subscription');
        return response.data;
    },
    createCheckout: async (data: CheckoutRequest) => {
        const response = await agent.post<CheckoutResponse>('/subscription/checkout', data);
        return response.data;
    },
    changePlan: async (data: ChangePlanRequest) => {
        const response = await agent.post('/subscription/change-plan', data);
        return response.data;
    },
    cancelSubscription: async (data: CancelSubscriptionRequest = { immediate: false }) => {
        const response = await agent.post('/subscription/cancel', data);
        return response.data;
    },
    resumeSubscription: async () => {
        const response = await agent.post('/subscription/resume');
        return response.data;
    },
};

export default subscriptionApi;
