import {
    UserTableFilters
} from "@/features/admin/components/users-management-tab/user-table-filters.tsx";
import {UserTableToolbar} from "@/features/admin/components/users-management-tab/user-table-toolbar.tsx";
import {UserPagination} from "@/features/admin/components/users-management-tab/user-pagination.tsx";
import { useState, useCallback, useEffect, memo } from "react";
import type {AdminPaginatedUsersQuery, AdminUserListItem} from "@/features/admin/types.ts";
import {UserTable} from "@/features/admin/components/users-management-tab/user-table.tsx";

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

const MemoizedUserTable = memo(UserTable);
const MemoizedUserPagination = memo(UserPagination);

const testUser: AdminUserListItem = {
    id: "01a163ac-8fd5-7d79-a5b2-57f8585bfd1d",
    userName: "TestSubUser",
    email: "testsubuser@test.com",
    displayName: "TestSubUser",
    emailConfirmed: true,
    refreshTokenExpiryTime: "2026-11-04T20:20:30.004362Z",
    createdAt: "2026-10-22T12:53:35.721175Z",
    lastActive: "2026-10-22T12:53:35.721175Z"
}

const testUsers: AdminUserListItem[] = Array.from({ length: 20 }, (_, index) => ({
    ...testUser,
    id: `${testUser.id}-${index}`,
    userName: `${testUser.userName}_${index + 1}`,
    emailConfirmed: index % 2 === 0,
}));

const DEFAULT_FILTERS: UserFilters = {
    role: "all",
    plan: "all",
    status: "all",
    search: ""
};

export default function UsersManagementTab() {
    const [draftFilters, setDraftFilters] = useState<UserFilters>(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<UserFilters>(DEFAULT_FILTERS);
    const [rowsPerPage, setRowsPerPageState] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [sorting, setSorting] = useState<UserSorting | null>(null)
    
    const totalCount = 93;
    const totalPages = Math.ceil(totalCount / rowsPerPage);
    
    useEffect(() => {
        const query: AdminPaginatedUsersQuery = {
            pageNumber: currentPage,
            pageSize: rowsPerPage,
            role: appliedFilters.role,
            plan: appliedFilters.plan,
            status: appliedFilters.status,
            search: appliedFilters.search,
            sortingCol: sorting?.id,
            sortingDesc: sorting?.desc,
        };
        console.log("Sending query:", query);
    }, [currentPage, rowsPerPage, appliedFilters, sorting]);

    const handleFilterChange = useCallback((nextFilters: Partial<UserFilters>) => {
        setDraftFilters(prev => ({ ...prev, ...nextFilters }));
    }, []);

    const handleSearchChange = useCallback((search: string) => {
        setDraftFilters(prev => ({ ...prev, search }));
    }, []);
    
    const handleApplyFilters = useCallback(() => {
        setAppliedFilters(draftFilters);
        setCurrentPage(1);
    }, [draftFilters]);

    const handleRowsPerPageChange = useCallback((n: number) => {
        setRowsPerPageState(n);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleSortingChange = useCallback((nextSorting: UserSorting | null) => {
        setSorting(nextSorting);
        setCurrentPage(1);
    }, []);

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
                    paginatedUsers={testUsers}
                    sorting={sorting}
                    onSortingChange={handleSortingChange}
                />
            </div>
            <MemoizedUserPagination
                showingFrom={(currentPage - 1) * rowsPerPage + 1}
                showingTo={Math.min(currentPage * rowsPerPage, totalCount)}
                total={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>

    )
}