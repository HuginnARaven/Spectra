import {Button} from "@/components/ui/button"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {Spinner} from "@/components/ui/spinner"
import {cn} from "@/lib/utils"
import {
    formatPrice,
    formatIntervalPeriod,
    getPlanFeatures,
} from "../utils"
import type {
    SubscriptionPlan,
    SubscriptionPrice,
} from "../types"
import {CircleCheck} from "lucide-react"

interface PricingCardProps {
    plan: SubscriptionPlan
    selectedInterval: string
    isCurrentPlan: boolean
    isHighlighted: boolean
    isCheckingOut: boolean
    onSelectPlan: (plan: SubscriptionPlan) => void
}

export function PricingCard({ plan, selectedInterval, isCurrentPlan, isHighlighted, isCheckingOut, onSelectPlan }: PricingCardProps) {
    const activePrice = plan.isDefault ? null : plan.prices?.find(
        (p): p is SubscriptionPrice => Boolean(p && p.isActive && p.interval.toLowerCase() === selectedInterval.toLowerCase())
    )

    const amount = activePrice ? activePrice.amount : 0
    const currencyCode = activePrice?.currencyCode ?? "usd"
    const formattedPrice = formatPrice(amount, currencyCode)
    const periodLabel = activePrice ? formatIntervalPeriod(activePrice.interval) : formatIntervalPeriod(selectedInterval)

    let buttonText = "Get Started"
    if (isCurrentPlan) {
        buttonText = "Current Plan"
    } else if (plan.isDefault) {
        buttonText = "Start for Free"
    }

    const buttonVariant = isHighlighted ? "default" : "outline"
    const isButtonDisabled = Boolean(isCurrentPlan || isCheckingOut)
    const features = getPlanFeatures(plan)

    return (
        <Card className={cn("flex w-full sm:w-[280px] lg:w-[285px] flex-col justify-between rounded-2xl py-6 gap-0 transition-all", isHighlighted ? "border-2 border-foreground shadow-sm" : "border-border")}>
            <div>
                <CardHeader className="gap-0 px-6 pt-0 pb-0">
                    <CardTitle className="font-semibold text-base text-foreground">
                        {plan.name}
                    </CardTitle>
                    <div className="mt-3 flex flex-col">
                        <span className="font-bold text-4xl tracking-tight text-foreground lg:text-5xl">
                            {formattedPrice}
                        </span>
                        <span className="mt-0.5 text-xs text-muted-foreground">
                            {periodLabel}
                        </span>
                    </div>
                    <CardDescription className="mt-3 min-h-8 text-xs leading-relaxed text-muted-foreground">
                        {plan.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4 px-6 pt-4 pb-0">
                    <Button
                        variant={buttonVariant}
                        disabled={isButtonDisabled}
                        onClick={() => onSelectPlan(plan)}
                        className="w-full rounded-lg font-medium cursor-pointer"
                    >
                        {isCheckingOut && (
                            <Spinner data-icon="inline-start" className="mr-2"/>
                        )}
                        {buttonText}
                    </Button>
                    <div className="relative flex items-center justify-center">
                        <Separator className="w-full"/>
                        <span className="absolute bg-card px-2 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                            FEATURES
                        </span>
                    </div>
                    <ul className="flex flex-col gap-2.5">
                        {features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2.5 text-xs text-foreground/80">
                                <CircleCheck className="size-4 shrink-0 text-muted-foreground"/>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </div>
        </Card>
    )
}
