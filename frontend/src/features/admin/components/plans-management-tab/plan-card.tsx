import { useState, useMemo, memo } from 'react'
import {
    CircleCheck,
    CreditCardIcon,
    EllipsisVerticalIcon,
    PencilIcon,
    Trash2Icon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
    INTERVAL_PRIORITY,
    formatPrice,
    formatIntervalPeriod,
    getPlanFeatures,
} from '@/features/pricing/utils'
import type { SubscriptionPlan, SubscriptionPrice } from '@/features/admin/types'
import { EditPlanDialog } from '@/features/admin/components/plans-management-tab/edit-plan-dialog'
import { ManagePlanPricesDialog } from '@/features/admin/components/plans-management-tab/manage-plan-prices-dialog'
import { DeletePlanAlertDialog } from '@/features/admin/components/plans-management-tab/delete-plan-alert-dialog'

export interface PlanCardProps {
    plan: SubscriptionPlan
    selectedInterval: string
}

export const PlanCard = memo(function PlanCard({
    plan,
    selectedInterval,
}: PlanCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isPricesOpen, setIsPricesOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const validPrices = useMemo(() => {
        const prices = (plan.prices ?? []).filter(
            (p): p is SubscriptionPrice => p !== null && p !== undefined
        )
        return [...prices].sort((a, b) => {
            if (a.amount !== b.amount) return a.amount - b.amount
            if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
            const indexA = INTERVAL_PRIORITY.indexOf(a.interval.toLowerCase())
            const indexB = INTERVAL_PRIORITY.indexOf(b.interval.toLowerCase())
            return (indexA !== -1 ? indexA : 99) - (indexB !== -1 ? indexB : 99)
        })
    }, [plan.prices])

    const activePricesCount = useMemo(
        () => validPrices.filter(p => p.isActive).length,
        [validPrices]
    )

    const displayPrice = useMemo(() => {
        if (plan.isDefault) return null

        if (selectedInterval.toLowerCase() === 'all') {
            const activePrices = validPrices.filter(p => p.isActive)
            return activePrices[0] ?? validPrices[0] ?? null
        }

        const intervalPrices = validPrices.filter(
            p => p.interval.toLowerCase() === selectedInterval.toLowerCase()
        )
        const activeIntervalPrices = intervalPrices.filter(p => p.isActive)
        return activeIntervalPrices[0] ?? intervalPrices[0] ?? null
    }, [plan.isDefault, selectedInterval, validPrices])

    const amount = displayPrice ? displayPrice.amount : 0
    const currencyCode = displayPrice?.currencyCode ?? 'usd'
    const formattedPrice = formatPrice(amount, currencyCode)
    const periodLabel = plan.isDefault
        ? formatIntervalPeriod(
              selectedInterval.toLowerCase() === 'all' ? 'month' : selectedInterval
          )
        : displayPrice
          ? formatIntervalPeriod(displayPrice.interval)
          : 'No price configured'

    const features = getPlanFeatures(plan)

    return (
        <Card
            className={cn(
                'flex w-full sm:w-[280px] lg:w-[295px] flex-col justify-between rounded-2xl py-6 gap-0 transition-all',
                !plan.isActive
                    ? 'border-dashed border-muted-foreground/30 bg-muted/40 opacity-60 saturate-50'
                    : plan.isDefault
                      ? 'border-2 border-foreground shadow-sm'
                      : 'border-border'
            )}
        >
            <div>
                <CardHeader className="gap-0 px-6 pt-0 pb-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <CardTitle
                                className={cn(
                                    'font-semibold text-base truncate',
                                    plan.isActive
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {plan.name}
                            </CardTitle>
                            {!plan.isActive && (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 border-destructive/40 text-destructive"
                                >
                                    Inactive
                                </Badge>
                            )}
                            {plan.isDefault && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    Default
                                </Badge>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon-xs"
                                    variant="ghost"
                                    aria-label="Open plan actions"
                                    className="shrink-0"
                                >
                                    <EllipsisVerticalIcon className="size-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                        <PencilIcon className="size-4" />
                                        Edit Plan
                                    </DropdownMenuItem>
                                    {!plan.isDefault && (
                                        <DropdownMenuItem onClick={() => setIsPricesOpen(true)}>
                                            <CreditCardIcon className="size-4" />
                                            Manage Prices
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => setIsDeleteOpen(true)}
                                    >
                                        <Trash2Icon className="size-4" />
                                        Delete Plan
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="mt-3 flex flex-col">
                        <span
                            className={cn(
                                'font-bold text-4xl tracking-tight lg:text-5xl',
                                plan.isActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground'
                            )}
                        >
                            {formattedPrice}
                        </span>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">
                                {periodLabel}
                            </span>
                            {!plan.isDefault && displayPrice && !displayPrice.isActive && (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 border-destructive/40 text-destructive"
                                >
                                    Inactive
                                </Badge>
                            )}
                        </div>
                    </div>

                    <CardDescription className="mt-3 min-h-8 text-xs leading-relaxed text-muted-foreground">
                        {plan.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4 px-6 pt-4 pb-0">
                    {plan.isDefault ? (
                        <Button
                            variant="default"
                            onClick={() => setIsEditOpen(true)}
                            className="w-full rounded-lg font-medium cursor-pointer"
                        >
                            <PencilIcon className="size-4" />
                            <span>Edit Plan</span>
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditOpen(true)}
                                className="flex-1 rounded-lg font-medium cursor-pointer"
                            >
                                <PencilIcon className="size-4" />
                                <span>Edit Plan</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsPricesOpen(true)}
                                className="flex-1 rounded-lg font-medium cursor-pointer"
                            >
                                <CreditCardIcon className="size-4" />
                                <span>
                                    Prices ({activePricesCount}/{validPrices.length})
                                </span>
                            </Button>
                        </div>
                    )}

                    <div className="relative flex items-center justify-center">
                        <Separator className="w-full" />
                        <span className="absolute bg-card px-2 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                            FEATURES
                        </span>
                    </div>

                    <ul className="flex flex-col gap-2.5">
                        {features.map(feature => (
                            <li
                                key={feature}
                                className="flex items-center gap-2.5 text-xs text-foreground/80"
                            >
                                <CircleCheck className="size-4 shrink-0 text-muted-foreground" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </div>

            <EditPlanDialog
                plan={plan}
                isOpen={isEditOpen}
                setOpen={setIsEditOpen}
            />
            {!plan.isDefault && (
                <ManagePlanPricesDialog
                    plan={plan}
                    isOpen={isPricesOpen}
                    setOpen={setIsPricesOpen}
                />
            )}
            <DeletePlanAlertDialog
                planId={plan.id}
                planName={plan.name}
                isOpen={isDeleteOpen}
                setOpen={setIsDeleteOpen}
            />
        </Card>
    )
})
