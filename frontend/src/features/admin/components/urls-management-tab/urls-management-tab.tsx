import { useState, useCallback, useEffect, memo } from 'react'
import { UrlTableToolbar } from '@/features/admin/components/urls-management-tab/url-table-toolbar'
import { UrlPagination } from '@/features/admin/components/urls-management-tab/url-pagination'
import { UrlTable, type UrlSorting } from '@/features/admin/components/urls-management-tab/url-table'
import { CreateUrlDialog } from '@/features/admin/components/urls-management-tab/create-url-dialog'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchAdminUrls } from '@/features/admin/adminSlice'
import type { AdminPaginatedUrlsQuery } from '@/features/admin/types'

const MemoizedUrlTable = memo(UrlTable)
const MemoizedUrlPagination = memo(UrlPagination)

export default function UrlsManagementTab() {
    const dispatch = useAppDispatch()
    const { urls, urlsTotalCount, isUrlsLoading } = useAppSelector(state => state.admin)

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [rowsPerPage, setRowsPerPageState] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [sorting, setSorting] = useState<UrlSorting | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    // Debounce search string
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setCurrentPage(1)
        }, 300)

        return () => clearTimeout(timer)
    }, [search])

    const totalPages = Math.max(1, Math.ceil(urlsTotalCount / rowsPerPage))
    const showingFrom = urlsTotalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
    const showingTo = Math.min(currentPage * rowsPerPage, urlsTotalCount)

    useEffect(() => {
        const query: AdminPaginatedUrlsQuery = {
            pageNumber: currentPage,
            pageSize: rowsPerPage,
            search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
            sortingCol: sorting?.id,
            sortingDesc: sorting?.desc
        }

        dispatch(fetchAdminUrls(query))
    }, [dispatch, currentPage, rowsPerPage, debouncedSearch, sorting])

    const handleSearchChange = useCallback((nextSearch: string) => {
        setSearch(nextSearch)
    }, [])

    const handleRowsPerPageChange = useCallback((n: number) => {
        setRowsPerPageState(n)
        setCurrentPage(1)
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handleSortingChange = useCallback((nextSorting: UrlSorting | null) => {
        setSorting(nextSorting)
        setCurrentPage(1)
    }, [])

    return (
        <div className="w-full h-full">
            <div className="border-b">
                <UrlTableToolbar
                    search={search}
                    rowsPerPage={rowsPerPage}
                    onSearch={handleSearchChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onCreateUrl={() => setIsCreateDialogOpen(true)}
                />
                <MemoizedUrlTable
                    paginatedUrls={urls}
                    sorting={sorting}
                    onSortingChange={handleSortingChange}
                    isLoading={isUrlsLoading}
                />
            </div>
            <MemoizedUrlPagination
                showingFrom={showingFrom}
                showingTo={showingTo}
                total={urlsTotalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
            <CreateUrlDialog
                isOpen={isCreateDialogOpen}
                setOpen={setIsCreateDialogOpen}
            />
        </div>
    )
}
