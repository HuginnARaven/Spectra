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

export interface CheckoutRequest {
    priceId: string;
}

export interface CheckoutResponse {
    checkoutUrl: string;
}
