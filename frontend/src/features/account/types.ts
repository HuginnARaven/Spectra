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