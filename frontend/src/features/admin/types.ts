export interface AdminUserListItem {
    id: string;
    userName: string;
    email: string;
    displayName: string;
    emailConfirmed: boolean;
    refreshTokenExpiryTime: string;
    createdAt: string;
    lastActive: string;
}

export interface AdminUserDetails {
    id: string;
    userName: string;
    email: string;
    displayName: string;
    emailConfirmed: boolean;
    refreshTokenExpiryTime: string;
    createdAt: string;
    lastActive: string;
    userSubscription: AdminUserSubscriptionInfo;
    roles: string[];
}

export interface AdminUserSubscriptionInfo {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    canceledAt: string | null;
    cancelAtPeriodEnd: boolean;
    subscriptionPlanId: string;
    planName: string;
    subscriptionPlanPriceId: string;
    amount: number;
    currencyCode: string;
    interval: string;
}

export interface AdminUserRequest {
    username: string;
    email: string;
    displayName: string;
    emailConfirmed: boolean;
}

export interface AdminUrlListItem {
    id: string;
    originalUrl: string;
    shortCode: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface AdminUrlRequest {
    originalUrl: string;
    shortCode: string;
    userId: string;
}

export interface SubscriptionPrice {
    id: string;
    amount: number;
    currencyCode: string;
    interval: string;
    isActive: boolean;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
    hasAccessToGeneralAnalytics: boolean;
    hasAccessToUrlAnalytics: boolean;
    hasCustomAliasAccess: boolean;
    hasEarlyFeatureAccess: boolean;
    maxUrlsLimit: number;
    analyticsRetentionDays: number;
    prices: (SubscriptionPrice | null)[];
}

export interface CreateSubscriptionPlanRequest {
    name: string;
    description: string;
    isDefault: boolean;
    hasAccessToGeneralAnalytics: boolean;
    hasAccessToUrlAnalytics: boolean;
    hasCustomAliasAccess?: boolean;
    hasEarlyFeatureAccess?: boolean;
    maxUrlsLimit?: number;
    analyticsRetentionDays?: number;
    price?: number | null;
    currencyCode?: string | null;
    interval?: string | null;
}

export interface UpdateSubscriptionPlanRequest {
    name: string;
    description: string;
    hasAccessToGeneralAnalytics: boolean;
    hasAccessToUrlAnalytics: boolean;
    hasCustomAliasAccess?: boolean;
    hasEarlyFeatureAccess?: boolean;
    maxUrlsLimit?: number;
    analyticsRetentionDays?: number;
}

export interface CreateSubscriptionPriceRequest {
    amount: number;
    currencyCode: string;
    interval: string;
    isActive: boolean;
}

export interface UpdateSubscriptionPriceRequest {
    isActive: boolean;
}

export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages?: number;
}

export type SubscriptionStatus = 'Active' | 'PastDue' | 'Canceled' | 'Incomplete';

export interface Role {
    id: string;
    name: string;
}

export interface AdminPaginatedUsersQuery {
    pageNumber: number;
    pageSize: number;
    roleId?: string;
    planId?: string;
    status?: SubscriptionStatus | string;
    search?: string;
    sortingCol?: string;
    sortingDesc?: boolean;
}

export interface AdminPaginatedUrlsQuery {
    pageNumber: number;
    pageSize: number;
    search?: string;
    sortingCol?: string;
    sortingDesc?: boolean;
}
