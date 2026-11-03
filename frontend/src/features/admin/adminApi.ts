import agent from '@/api/agent';
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
    PaginatedResult, AdminUserDetails,
    AdminPaginatedUsersQuery,
    Role,
} from './types';

export const adminApi = {
    // User management
    getUsers: async (query?: AdminPaginatedUsersQuery) => {
        const response = await agent.get<PaginatedResult<AdminUserListItem>>(
            '/account/admin/get-users',
            { params: query }
        );
        return response.data;
    },
    getRoles: async () => {
        const response = await agent.get<Role[]>('/account/admin/get-roles');
        return response.data;
    },
    getUserById: async (id: string) => {
        const response = await agent.get<AdminUserDetails>(`/account/admin/get-user/${id}`);
        return response.data;
    },
    editUser: async (id: string, data: AdminUserRequest) => {
        const response = await agent.put<AdminUserListItem>(`/account/admin/edit-user/${id}`, data);
        return response.data;
    },
    deleteUser: async (id: string) => {
        const response = await agent.delete(`/account/admin/delete-user/${id}`);
        return response.data;
    },

    // URL management
    getUrls: async (pageNumber: number = 1, pageSize: number = 10) => {
        const response = await agent.get<PaginatedResult<AdminUrlListItem>>(
            '/urls/admin/get-urls',
            { params: { pageNumber, pageSize } }
        );
        return response.data;
    },
    getUrlById: async (id: string) => {
        const response = await agent.get<AdminUrlListItem>(`/urls/admin/get-url/${id}`);
        return response.data;
    },
    createUrl: async (data: AdminUrlRequest) => {
        const response = await agent.post<AdminUrlListItem>('/urls/admin/create-url', data);
        return response.data;
    },
    editUrl: async (id: string, data: AdminUrlRequest) => {
        const response = await agent.put<AdminUrlListItem>(`/urls/admin/edit-url/${id}`, data);
        return response.data;
    },
    deleteUrl: async (id: string) => {
        const response = await agent.delete(`/urls/admin/delete-url/${id}`);
        return response.data;
    },

    // Subscription Plans management
    getSubscriptionPlans: async () => {
        const response = await agent.get<SubscriptionPlan[]>('/subscriptionplans/get-subscription-plans');
        return response.data;
    },
    getSubscriptionPlanById: async (id: string) => {
        const response = await agent.get<SubscriptionPlan>(`/subscriptionplans/get-subscription-plan/${id}`);
        return response.data;
    },
    createSubscriptionPlan: async (data: CreateSubscriptionPlanRequest) => {
        const response = await agent.post('/subscriptionplans/admin/create-subscription-plan', data);
        return response.data;
    },
    addPriceToPlan: async (planId: string, data: CreateSubscriptionPriceRequest) => {
        const response = await agent.post(`/subscriptionplans/admin/add-price-to-plan/${planId}`, data);
        return response.data;
    },
    updateSubscriptionPlan: async (id: string, data: UpdateSubscriptionPlanRequest) => {
        const response = await agent.put(`/subscriptionplans/admin/update-subscription-plan/${id}`, data);
        return response.data;
    },
    deleteSubscriptionPlan: async (id: string) => {
        const response = await agent.delete(`/subscriptionplans/admin/delete-subscription-plan/${id}`);
        return response.data;
    },
    updateSubscriptionPrice: async (id: string, data: UpdateSubscriptionPriceRequest) => {
        const response = await agent.put(`/subscriptionplans/admin/update-subscription-price/${id}`, data);
        return response.data;
    },
};

export default adminApi;
