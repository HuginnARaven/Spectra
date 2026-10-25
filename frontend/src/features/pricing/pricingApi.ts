import agent from '@/api/agent';
import type { SubscriptionPlan, CheckoutRequest, CheckoutResponse } from './types';

const pricingApi = {
    getSubscriptionPlans: async () => {
        const response = await agent.get<SubscriptionPlan[]>('/subscriptionplans/get-subscription-plans');
        return response.data;
    },
    createCheckoutSession: async (data: CheckoutRequest) => {
        const response = await agent.post<CheckoutResponse>('/subscription/checkout', data);
        return response.data;
    },
};

export default pricingApi;
