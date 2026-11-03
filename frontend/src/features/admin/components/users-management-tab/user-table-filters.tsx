import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchAdminRoles } from '@/features/admin/adminSlice'
import { fetchSubscriptionPlans } from '@/features/pricing/pricingSlice'
import type { UserFilters } from '@/features/admin/components/users-management-tab/users-management-tab.tsx'

// TODO: Implement server endpoint to fetch available subscription statuses dynamically
const STATUSES = ['Active', 'PastDue', 'Canceled', 'Incomplete'] as const

export interface UserTableFiltersProps {
    filters: UserFilters
    onFilterChange: (filters: Partial<UserFilters>) => void
}

export function UserTableFilters({ filters, onFilterChange }: UserTableFiltersProps) {
    const dispatch = useAppDispatch()
    const roles = useAppSelector(state => state.admin.roles)
    const plans = useAppSelector(state => state.pricing.plans)

    useEffect(() => {
        if (!roles || roles.length === 0) {
            dispatch(fetchAdminRoles())
        }
        if (!plans || plans.length === 0) {
            dispatch(fetchSubscriptionPlans())
        }
    }, [dispatch, roles, plans])

    return (
        <div className='flex flex-col gap-4 border-b p-6'>
            <div className='grid grid-cols-1 gap-6 max-md:*:last:col-span-full sm:grid-cols-2 md:grid-cols-3'>
                <div className='flex w-full flex-col gap-2'>
                    <Label htmlFor='filter-role'>Select Role</Label>
                    <Select
                        value={filters.role}
                        onValueChange={(value: string | null) => {
                            if (value) {
                                onFilterChange({ role: value as UserFilters['role'] })
                            }
                        }}
                    >
                        <SelectTrigger id='filter-role' className='w-full'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value='all'>All</SelectItem>
                                {roles.map(role => (
                                    <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex w-full flex-col gap-2'>
                    <Label htmlFor='filter-plan'>Select Plan</Label>
                    <Select
                        value={filters.plan}
                        onValueChange={(value: string | null) => {
                            if (value) {
                                onFilterChange({ plan: value as UserFilters['plan'] })
                            }
                        }}
                    >
                        <SelectTrigger id='filter-plan' className='w-full'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value='all'>All</SelectItem>
                                {plans.map(plan => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                        {plan.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex w-full flex-col gap-2'>
                    <Label htmlFor='filter-status'>Select Status</Label>
                    <Select
                        value={filters.status}
                        onValueChange={(value: string | null) => {
                            if (value) {
                                onFilterChange({ status: value as UserFilters['status'] })
                            }
                        }}
                    >
                        <SelectTrigger id='filter-status' className='w-full'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value='all'>All</SelectItem>
                                {STATUSES.map(status => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
