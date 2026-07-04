import * as React from "react"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import {restrictToVerticalAxis} from "@dnd-kit/modifiers"
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from "@tabler/icons-react"
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table"

import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {useAppDispatch, useAppSelector} from "@/app/hooks"
import {fetchAllVisits} from "@/features/dashboard/dashboardSlice"
import type {UrlVisitData} from "@/features/analytics/types"
import {Loader2} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {Skeleton} from "@/components/ui/skeleton.tsx";

const columns: ColumnDef<UrlVisitData>[] = [
    {
        accessorKey: "ipAddress",
        header: "IpAddress",
        cell: ({row}) => {
            return row.original.ipAddress
        },
        enableHiding: false,
    },
    {
        accessorKey: "country",
        header: "Country",
        cell: ({row}) => {
            return row.original.country
        },
        enableHiding: false,
    },
    {
        accessorKey: "city",
        header: "City",
        cell: ({row}) => {
            return row.original.city
        },
        enableHiding: false,
    },
    {
        accessorKey: "browser",
        header: "Browser",
        cell: ({row}) => {
            return row.original.browser
        },
        enableHiding: false,
    },
    {
        accessorKey: "deviceType",
        header: "Device type",
        cell: ({row}) => {
            return row.original.deviceType
        },
        enableHiding: false,
    },
    {
        accessorKey: "referrer",
        header: "Referrer",
        cell: ({row}) => {
            return row.original.referrer ? row.original.referrer : "Direct"
        },
        enableHiding: false,
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({row}) => {
            return new Date(row.original.createdAt).toLocaleString()
        },
        enableHiding: false,
    }
]

export function DataTable() {
    const dispatch = useAppDispatch()
    const {allVisits, totalCount, isLoading} = useAppSelector((state) => state.dashboard)

    const [data, setData] = React.useState<UrlVisitData[]>([])

    React.useEffect(() => {
        setData(allVisits)
    }, [allVisits])

    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })

    React.useEffect(() => {
        dispatch(fetchAllVisits({page: pagination.pageIndex + 1, pageSize: pagination.pageSize}))
    }, [dispatch, pagination.pageIndex, pagination.pageSize])

    const sortableId = React.useId()
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map(({id}) => id) || [],
        [data]
    )

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(totalCount / pagination.pageSize) || -1,
        manualPagination: true,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event
        if (active && over && active.id !== over.id) {
            setData((data) => {
                const oldIndex = dataIds.indexOf(active.id)
                const newIndex = dataIds.indexOf(over.id)
                return arrayMove(data, oldIndex, newIndex)
            })
        }
    }

    return (
        <div className="flex flex-col h-full min-h-0 w-full gap-4 pb-4">
            <div className="flex-1 min-h-0 relative">
                <div className="absolute inset-0 px-4 lg:px-6">
                    {
                        isLoading ?
                            <Skeleton className="flex flex-col h-full"/>
                            :
                            <div className="h-full overflow-hidden rounded-lg border [&>div]:h-full [&>div]:overflow-auto">
                                <DndContext
                                    collisionDetection={closestCenter}
                                    modifiers={[restrictToVerticalAxis]}
                                    onDragEnd={handleDragEnd}
                                    sensors={sensors}
                                    id={sortableId}
                                >
                                    <Table>
                                        <TableHeader className="bg-muted sticky top-0 z-10 shadow-sm">
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => {
                                                        return (
                                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                            </TableHead>
                                                        )
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                            {isLoading && data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary"/>
                                                    </TableCell>
                                                </TableRow>
                                            ) : table.getRowModel().rows?.length ? (
                                                <SortableContext
                                                    items={dataIds}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {table.getRowModel().rows.map((row) => (
                                                        <TableRow key={row.id} className="relative z-0">
                                                            {row.getVisibleCells().map((cell) => (
                                                                <TableCell key={cell.id}>
                                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </SortableContext>
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={columns.length}
                                                        className="h-24 text-center"
                                                    >
                                                        No results.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </DndContext>
                            </div>
                    }
                </div>
            </div>
            <div className="flex items-center justify-between px-4 lg:px-6 z-20" hidden={isLoading}>
                <div className="text-muted-foreground hidden flex-1 text-sm lg:flex"/>
                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium">
                            Rows per page
                        </Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                <SelectValue
                                    placeholder={table.getState().pagination.pageSize}
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <IconChevronsLeft/>
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <IconChevronLeft/>
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <IconChevronRight/>
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <IconChevronsRight/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
