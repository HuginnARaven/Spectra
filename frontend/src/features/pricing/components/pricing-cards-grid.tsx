import {Spinner} from "@/components/ui/spinner"
import {PricingCard} from "./pricing-card"
import type {SubscriptionPlan, SubscriptionPrice} from "../types"

interface PricingCardsGridProps {
    plans: SubscriptionPlan[]
    selectedInterval: string
    currentSubscriptionPlanId: string | null
    checkoutPriceId: string | null
    isCheckingOut: boolean
    isLoading: boolean
    onSelectPlan: (plan: SubscriptionPlan) => void
}

export function PricingCardsGrid({plans, selectedInterval, currentSubscriptionPlanId, checkoutPriceId, isCheckingOut, isLoading, onSelectPlan}: PricingCardsGridProps) {
    if (isLoading && plans.length === 0) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Spinner className="size-8"/>
            </div>
        )
    }
    
    const visiblePlans = plans.filter((plan) => {
        if (plan.isDefault) {
            return true
        }
        return plan.prices?.some(
            (p) => p && p.isActive && p.interval.toLowerCase() === selectedInterval.toLowerCase()
        )
    })
    
    const getPlanPriceAmount = (plan: SubscriptionPlan) => {
        if (plan.isDefault) return 0
        const activePrice = plan.prices?.find(
            (p) => p && p.isActive && p.interval.toLowerCase() === selectedInterval.toLowerCase()
        )
        return activePrice?.amount ?? 0
    }

    const sortedPlans = [...visiblePlans].sort(
        (a, b) => getPlanPriceAmount(a) - getPlanPriceAmount(b)
    )

    return (
        <div className="flex w-full flex-wrap justify-center items-stretch gap-6">
            {sortedPlans.map((plan) => {
                const activePrice = plan.isDefault ? null : plan.prices?.find(
                    (p): p is SubscriptionPrice => Boolean(p && p.isActive && p.interval.toLowerCase() === selectedInterval.toLowerCase())
                )
                
                const isCurrentPlan = Boolean(currentSubscriptionPlanId && plan.id === currentSubscriptionPlanId)
                const isHighlighted = isCurrentPlan // TODO: Huh??? 
                const isPlanCheckingOut = Boolean(isCheckingOut && activePrice && checkoutPriceId === activePrice.id)

                return (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        selectedInterval={selectedInterval}
                        isCurrentPlan={isCurrentPlan}
                        isHighlighted={isHighlighted}
                        isCheckingOut={isPlanCheckingOut}
                        onSelectPlan={onSelectPlan}
                    />
                )
            })}
        </div>
    )
}
