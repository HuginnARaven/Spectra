import type {SubscriptionPlan} from "./types"

export const ALLOWED_INTERVALS = ["day", "week", "month", "year"] as const
export const INTERVAL_PRIORITY = ["month", "year", "week", "day"]

export function formatIntervalLabel(interval: string): string {
    switch (interval.toLowerCase()) {
        case "day":
            return "Daily"
        case "week":
            return "Weekly"
        case "month":
            return "Monthly"
        case "year":
            return "Yearly"
        default:
            return interval.charAt(0).toUpperCase() + interval.slice(1)
    }
}

export function formatIntervalPeriod(interval: string): string {
    switch (interval.toLowerCase()) {
        case "day":
            return "/ Per day"
        case "week":
            return "/ Per week"
        case "month":
            return "/ Per month"
        case "year":
            return "/ Per year"
        default:
            return `/ Per ${interval}`
    }
}

export function formatPrice(amount: number, currencyCode: string = "usd"): string {
    try {
        const value = amount / 100
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode.toUpperCase(),
            minimumFractionDigits: value % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(value)
    } catch {
        const value = amount / 100
        return `$${value % 1 === 0 ? value : value.toFixed(2)}`
    }
}

export function getPlanFeatures(plan: SubscriptionPlan): string[] {
    const features: string[] = []

    // Max URLs limit
    if (plan.maxUrlsLimit <= -1) {
        features.push("Unlimited active URLs")
    } else if (plan.maxUrlsLimit === 0) {
        features.push("No active URLs")
    } else {
        features.push(`Up to ${plan.maxUrlsLimit.toLocaleString()} active URLs`)
    }

    // Analytics access
    if (plan.hasAccessToGeneralAnalytics) {
        features.push("General dashboard analytics")
    }
    if (plan.hasAccessToUrlAnalytics) {
        features.push("Detailed per-URL analytics")
    }

    // Analytics retention
    if (plan.analyticsRetentionDays <= 0) {
        features.push("Unlimited analytics retention")
    } else {
        features.push(`${plan.analyticsRetentionDays}-day analytics retention`)
    }

    // Custom alias access
    if (plan.hasCustomAliasAccess) {
        features.push("Custom URL aliases")
    }

    // Early feature access
    if (plan.hasEarlyFeatureAccess) {
        features.push("Early access to beta features")
    }

    return features
}
