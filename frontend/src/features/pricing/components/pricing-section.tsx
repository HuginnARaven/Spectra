import {useState, useMemo, useEffect} from "react"
import {useNavigate} from "react-router-dom"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { loadUser } from "@/features/account/accountSlice"
import {
    fetchSubscriptionPlans,
    createCheckoutSession,
} from "../pricingSlice"
import {PricingIntervalTabs} from "./pricing-interval-tabs"
import {PricingCardsGrid} from "./pricing-cards-grid"
import {ALLOWED_INTERVALS, INTERVAL_PRIORITY} from "../utils"
import type {
    SubscriptionPlan,
    SubscriptionPrice,
} from "../types"

export function PricingSection() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    
    const {isAuthenticated} = useAppSelector((state) => state.auth)
    const {user} = useAppSelector((state) => state.account)
    const {plans, isLoading, isCheckingOut, checkoutPriceId} = useAppSelector((state) => state.pricing)
    
    const currentSubscriptionPlanId = user?.subscriptionPlan?.id ?? null

    useEffect(() => {
        dispatch(fetchSubscriptionPlans())
        if (isAuthenticated && !user) {
            dispatch(loadUser())
        }
    }, [dispatch, isAuthenticated, user])

    // Extract unique active intervals matching allowed ones: day, week, month, year
    const availableIntervals = useMemo(() => {
        const intervalsSet = new Set<string>()

        plans.forEach((plan) => {
            plan.prices?.forEach((price) => {
                if (price && price.isActive && price.interval) {
                    const lowerInterval = price.interval.toLowerCase()
                    if (ALLOWED_INTERVALS.includes(lowerInterval as (typeof ALLOWED_INTERVALS)[number])) {
                        intervalsSet.add(lowerInterval)
                    }
                }
            })
        })

        return Array.from(intervalsSet).sort((a, b) => {
            const indexA = INTERVAL_PRIORITY.indexOf(a)
            const indexB = INTERVAL_PRIORITY.indexOf(b)
            return (indexA !== -1 ? indexA : 99) - (indexB !== -1 ? indexB : 99)
        })
    }, [plans])
    
    const [selectedInterval, setSelectedInterval] = useState<string>(() => availableIntervals[0] ?? "month")

    useEffect(() => {
        if (availableIntervals.length > 0 && !availableIntervals.includes(selectedInterval)) {
            setSelectedInterval(availableIntervals[0])
        }
    }, [availableIntervals, selectedInterval])

    const handleSelectPlan = async (plan: SubscriptionPlan) => {
        if (currentSubscriptionPlanId && plan.id === currentSubscriptionPlanId) {
            return
        }
        
        if (!isAuthenticated) {
            toast.info("Please sign in to choose a subscription plan.")
            navigate("/auth/login")
            return
        }

        if (plan.isDefault) {
            return
        }
        
        const activePrice = plan.prices?.find(
            (p): p is SubscriptionPrice => Boolean(p && p.isActive && p.interval.toLowerCase() === selectedInterval.toLowerCase())
        )

        if (!activePrice) {
            toast.error("No active price found for the selected billing interval.")
            return
        }

        try {
            const response = await dispatch(
                createCheckoutSession({priceId: activePrice.id})
            ).unwrap()

            if (response.checkoutUrl) {
                window.location.href = response.checkoutUrl
            } else {
                toast.error("Failed to retrieve checkout URL.")
            }
        } catch (err: any) {
            toast.error(err || "Failed to start checkout process.")
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center">
            <PricingIntervalTabs
                availableIntervals={availableIntervals}
                selectedInterval={selectedInterval}
                onIntervalChange={setSelectedInterval}
            />
            <PricingCardsGrid
                plans={plans}
                selectedInterval={selectedInterval}
                currentSubscriptionPlanId={currentSubscriptionPlanId}
                checkoutPriceId={checkoutPriceId}
                isCheckingOut={isCheckingOut}
                isLoading={isLoading}
                onSelectPlan={handleSelectPlan}
            />
        </div>
    )
}
