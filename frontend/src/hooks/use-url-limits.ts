import { useAppSelector } from "@/app/hooks";

export function useUrlLimits() {
    const { user } = useAppSelector((state) => state.account);
    const { urls, isLoading } = useAppSelector((state) => state.urls);

    const plan = user?.subscriptionPlan;
    const maxLimit = plan?.maxUrlsLimit ?? 0;
    const isUnlimited = maxLimit <= -1;
    const currentCount = urls.length;
    const isLimitReached = Boolean(user) && !isUnlimited && currentCount >= maxLimit;
    const remaining = isUnlimited ? Infinity : Math.max(0, maxLimit - currentCount);

    const usagePercentage = !user || isUnlimited ? 0 : maxLimit > 0 ? Math.min(100, Math.round((currentCount / maxLimit) * 100)) : 100;

    return {
        user,
        plan,
        planName: plan?.name ?? "Free",
        currentCount,
        maxLimit,
        isUnlimited,
        isLimitReached,
        remaining,
        usagePercentage,
        isLoading,
    };
}