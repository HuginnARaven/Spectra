import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type {UserFilters} from "@/features/admin/components/users-management-tab/users-management-tab.tsx";


const ROLES = ['Admin', 'Manager', 'Test']
const PLANS = ['Plus', 'Pro', 'Ultra']
const STATUSES = ['Active', 'Pending', 'Suspended', 'Inactive']

export interface UserTableFiltersProps {
    filters: UserFilters
    onFilterChange: (filters: Partial<UserFilters>) => void
}

export function UserTableFilters({ filters, onFilterChange }: UserTableFiltersProps) {
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
                                {ROLES.map(role => (
                                    <SelectItem key={role} value={role}>
                                        {role}
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
                                {PLANS.map(plan => (
                                    <SelectItem key={plan} value={plan}>
                                        {plan}
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