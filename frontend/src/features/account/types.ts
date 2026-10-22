export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    emailConfirmed: boolean;
    subscriptionPlan?: Subscription;
    createdAt: string;
}

export interface Subscription {
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
}


export interface ProfileRequest {
    username: string;
    email: string;
    displayName: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface SetPasswordRequest {
    password: string;
    confirmPassword: string;
}

export interface UserSubscription {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    canceledAt?: string | null;
    cancelAtPeriodEnd: boolean;
    subscriptionPlanId: string;
    planName: string;
    subscriptionPlanPriceId: string;
    amount: number;
    currencyCode: string;
    interval: string;
}

export interface CancelSubscriptionRequest {
    immediate: boolean;
}

export interface ChangePlanRequest {
    newPriceId: string;
}
