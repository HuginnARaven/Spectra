import { useState, useCallback, useEffect, memo } from 'react'
import { UserTableFilters } from '@/features/admin/components/users-management-tab/user-table-filters.tsx'
import { UserTableToolbar } from '@/features/admin/components/users-management-tab/user-table-toolbar.tsx'
import { UserPagination } from '@/features/admin/components/users-management-tab/user-pagination.tsx'
import { UserTable } from '@/features/admin/components/users-management-tab/user-table.tsx'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchAdminUsers } from '@/features/admin/adminSlice'
import type { AdminPaginatedUsersQuery } from '@/features/admin/types.ts'

export interface UserFilters {
    role: string | 'all'
    plan: string | 'all'
    status: string | 'all'
    search: string
}

export type UserSorting = {
    id: string
    desc: boolean
}

const MemoizedUserTable = memo(UserTable)
const MemoizedUserPagination = memo(UserPagination)

const DEFAULT_FILTERS: UserFilters = {
    role: 'all',
    plan: 'all',
    status: 'all',
    search: ''
}

export default function UsersManagementTab() {
    const dispatch = useAppDispatch()
    const { users, usersTotalCount, isUsersLoading } = useAppSelector(state => state.admin)

    const [draftFilters, setDraftFilters] = useState<UserFilters>(DEFAULT_FILTERS)
    const [appliedFilters, setAppliedFilters] = useState<UserFilters>(DEFAULT_FILTERS)
    const [rowsPerPage, setRowsPerPageState] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [sorting, setSorting] = useState<UserSorting | null>(null)

    const totalPages = Math.max(1, Math.ceil(usersTotalCount / rowsPerPage))
    const showingFrom = usersTotalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
    const showingTo = Math.min(currentPage * rowsPerPage, usersTotalCount)

    useEffect(() => {
        const query: AdminPaginatedUsersQuery = {
            pageNumber: currentPage,
            pageSize: rowsPerPage,
            roleId: appliedFilters.role === 'all' ? undefined : appliedFilters.role,
            planId: appliedFilters.plan === 'all' ? undefined : appliedFilters.plan,
            status: appliedFilters.status === 'all' ? undefined : appliedFilters.status,
            search: appliedFilters.search.trim() ? appliedFilters.search.trim() : undefined,
            sortingCol: sorting?.id,
            sortingDesc: sorting?.desc
        }

        dispatch(fetchAdminUsers(query))
    }, [dispatch, currentPage, rowsPerPage, appliedFilters, sorting])

    const handleFilterChange = useCallback((nextFilters: Partial<UserFilters>) => {
        setDraftFilters(prev => ({ ...prev, ...nextFilters }))
    }, [])

    const handleSearchChange = useCallback((search: string) => {
        setDraftFilters(prev => ({ ...prev, search }))
    }, [])

    const handleApplyFilters = useCallback(() => {
        setAppliedFilters(draftFilters)
        setCurrentPage(1)
    }, [draftFilters])

    const handleRowsPerPageChange = useCallback((n: number) => {
        setRowsPerPageState(n)
        setCurrentPage(1)
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handleSortingChange = useCallback((nextSorting: UserSorting | null) => {
        setSorting(nextSorting)
        setCurrentPage(1)
    }, [])

    return (
        <div className='w-full h-full'>
            <div className='border-b'>
                <UserTableFilters
                    filters={draftFilters}
                    onFilterChange={handleFilterChange}
                />
                <UserTableToolbar
                    search={draftFilters.search}
                    rowsPerPage={rowsPerPage}
                    onSearch={handleSearchChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onApplyFilters={handleApplyFilters}
                />
                <MemoizedUserTable
                    paginatedUsers={users}
                    sorting={sorting}
                    onSortingChange={handleSortingChange}
                    isLoading={isUsersLoading}
                />
            </div>
            <MemoizedUserPagination
                showingFrom={showingFrom}
                showingTo={showingTo}
                total={usersTotalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    )
}
