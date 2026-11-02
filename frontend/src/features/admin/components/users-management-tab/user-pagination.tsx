import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'

type UsePaginationProps = {
    currentPage: number
    totalPages: number
    paginationItemsToDisplay: number
}

type UsePaginationReturn = {
    pages: number[]
    showLeftEllipsis: boolean
    showRightEllipsis: boolean
}

function usePagination({currentPage, totalPages, paginationItemsToDisplay}: UsePaginationProps): UsePaginationReturn {
    function calculatePaginationRange(): number[] {
        if (totalPages <= paginationItemsToDisplay) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        const halfDisplay = Math.floor(paginationItemsToDisplay / 2)

        const initialRange = {
            start: currentPage - halfDisplay,
            end: currentPage + halfDisplay
        }

        const adjustedRange = {
            start: Math.max(1, initialRange.start),
            end: Math.min(totalPages, initialRange.end)
        }

        if (adjustedRange.start === 1) {
            adjustedRange.end = Math.min(paginationItemsToDisplay, totalPages)
        }

        if (adjustedRange.end === totalPages) {
            adjustedRange.start = Math.max(1, totalPages - paginationItemsToDisplay + 1)
        }

        return Array.from({ length: adjustedRange.end - adjustedRange.start + 1 }, (_, i) => adjustedRange.start + i)
    }

    const pages = calculatePaginationRange()

    // Determine ellipsis display based on the actual pages shown
    const showLeftEllipsis = pages.length > 0 && pages[0] > 1 && pages[0] > 2

    const showRightEllipsis =
        pages.length > 0 && pages[pages.length - 1] < totalPages && pages[pages.length - 1] < totalPages - 1

    return {
        pages,
        showLeftEllipsis,
        showRightEllipsis
    }
}

export interface UserPaginationProps {
    showingFrom: number
    showingTo: number
    total: number
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function UserPagination({showingFrom, showingTo, total, currentPage, totalPages, onPageChange}: UserPaginationProps) {
    const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
        currentPage,
        totalPages,
        paginationItemsToDisplay: 2
    })

    return (
        <div className='flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col'>
            <p className='text-muted-foreground text-sm whitespace-nowrap' aria-live='polite'>
                Showing <span>{showingFrom}</span> to <span>{showingTo}</span> of <span>{total}</span> entries
            </p>

            <div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                className='disabled:pointer-events-none disabled:opacity-50'
                                variant='ghost'
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                aria-label='Go to previous page'
                            >
                                <ChevronLeftIcon aria-hidden='true' />
                                <span className='max-sm:hidden'>Previous</span>
                            </Button>
                        </PaginationItem>

                        {showLeftEllipsis && (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        )}

                        {pages.map(page => {
                            const isActive = page === currentPage

                            return (
                                <PaginationItem key={page}>
                                    <Button
                                        size='icon'
                                        className={`${!isActive && 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'}`}
                                        onClick={() => onPageChange(page)}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        {page}
                                    </Button>
                                </PaginationItem>
                            )
                        })}

                        {showRightEllipsis && (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        )}

                        <PaginationItem>
                            <Button
                                className='disabled:pointer-events-none disabled:opacity-50'
                                variant='ghost'
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                aria-label='Go to next page'
                            >
                                <span className='max-sm:hidden'>Next</span>
                                <ChevronRightIcon aria-hidden='true' />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}