import { useState, useCallback, useEffect, useMemo } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchAdminSubscriptionPlans } from '@/features/admin/adminSlice'
import { ALLOWED_INTERVALS, INTERVAL_PRIORITY } from '@/features/pricing/utils'
import type { SubscriptionPlan } from '@/features/admin/types'
import { PlansToolbar } from '@/features/admin/components/plans-management-tab/plans-toolbar'
import { PlanCard } from '@/features/admin/components/plans-management-tab/plan-card'
import { CreatePlanDialog } from '@/features/admin/components/plans-management-tab/create-plan-dialog'

export default function PlansManagementTab() {
    const dispatch = useAppDispatch()
    const { subscriptionPlans, isPlansLoading } = useAppSelector(state => state.admin)

    const [search, setSearch] = useState('')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchAdminSubscriptionPlans())
    }, [dispatch])

    const availableIntervals = useMemo(() => {
        const intervalsSet = new Set<string>()

        subscriptionPlans.forEach(plan => {
            plan.prices?.forEach(price => {
                if (price && price.interval) {
                    const lowerInterval = price.interval.toLowerCase()
                    if (
                        ALLOWED_INTERVALS.includes(
                            lowerInterval as (typeof ALLOWED_INTERVALS)[number]
                        )
                    ) {
                        intervalsSet.add(lowerInterval)
                    }
                }
            })
        })

        const sortedIntervals = Array.from(intervalsSet).sort((a, b) => {
            const indexA = INTERVAL_PRIORITY.indexOf(a)
            const indexB = INTERVAL_PRIORITY.indexOf(b)
            return (indexA !== -1 ? indexA : 99) - (indexB !== -1 ? indexB : 99)
        })

        return ['all', ...sortedIntervals]
    }, [subscriptionPlans])

    const [selectedInterval, setSelectedInterval] = useState<string>('all')

    const activeInterval = availableIntervals.includes(selectedInterval)
        ? selectedInterval
        : 'all'

    const filteredAndSortedPlans = useMemo(() => {
        const trimmedSearch = search.trim().toLowerCase()

        const searchFiltered = trimmedSearch
            ? subscriptionPlans.filter(
                  plan =>
                      plan.name.toLowerCase().includes(trimmedSearch) ||
                      plan.description.toLowerCase().includes(trimmedSearch)
              )
            : subscriptionPlans

        const intervalFiltered =
            activeInterval === 'all'
                ? searchFiltered
                : searchFiltered.filter(plan =>
                      plan.prices?.some(
                          p =>
                              p !== null &&
                              p !== undefined &&
                              p.interval.toLowerCase() === activeInterval.toLowerCase()
                      )
                  )

        const getPlanPriceAmount = (plan: SubscriptionPlan) => {
            if (plan.isDefault) return -1

            const validPrices = (plan.prices ?? []).filter(
                (p): p is NonNullable<typeof p> => p !== null && p !== undefined
            )

            if (activeInterval === 'all') {
                const activePrices = validPrices.filter(p => p.isActive)
                const candidatePrices =
                    activePrices.length > 0 ? activePrices : validPrices
                if (candidatePrices.length === 0) return 0
                return Math.min(...candidatePrices.map(p => p.amount))
            }

            const intervalPrices = validPrices.filter(
                p => p.interval.toLowerCase() === activeInterval.toLowerCase()
            )
            const activeIntervalPrices = intervalPrices.filter(p => p.isActive)
            const candidatePrices =
                activeIntervalPrices.length > 0 ? activeIntervalPrices : intervalPrices

            if (candidatePrices.length === 0) return 0
            return Math.min(...candidatePrices.map(p => p.amount))
        }

        return [...intervalFiltered].sort(
            (a, b) => getPlanPriceAmount(a) - getPlanPriceAmount(b)
        )
    }, [subscriptionPlans, search, activeInterval])

    const handleSearchChange = useCallback((nextSearch: string) => {
        setSearch(nextSearch)
    }, [])

    const handleIntervalChange = useCallback((nextInterval: string) => {
        setSelectedInterval(nextInterval)
    }, [])

    const handleOpenCreateDialog = useCallback(() => {
        setIsCreateDialogOpen(true)
    }, [])

    return (
        <div className="w-full h-full">
            <PlansToolbar
                search={search}
                availableIntervals={availableIntervals}
                selectedInterval={activeInterval}
                onSearch={handleSearchChange}
                onIntervalChange={handleIntervalChange}
                onCreatePlan={handleOpenCreateDialog}
            />

            <div className="p-6">
                {isPlansLoading && subscriptionPlans.length === 0 ? (
                    <div className="flex h-64 w-full items-center justify-center gap-2 text-muted-foreground">
                        <Spinner className="size-6" />
                        <span>Loading subscription plans...</span>
                    </div>
                ) : filteredAndSortedPlans.length === 0 ? (
                    <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {search.trim()
                                ? 'No subscription plans match your search.'
                                : 'No subscription plans have been created yet.'}
                        </p>
                        {!search.trim() && (
                            <Button variant="outline" onClick={handleOpenCreateDialog}>
                                <PlusIcon className="size-4" />
                                <span>Create your first plan</span>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex w-full flex-wrap justify-center items-stretch gap-6">
                        {filteredAndSortedPlans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                selectedInterval={activeInterval}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreatePlanDialog
                isOpen={isCreateDialogOpen}
                setOpen={setIsCreateDialogOpen}
            />
        </div>
    )
}
