import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/app/hooks.ts";
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchUrlVisits } from "@/features/analytics/analyticsSlice.ts";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const generatePagination = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 4, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

export function VisitsTable() {
    const dispatch = useAppDispatch();
    const { urlVisits, totalCount, isLoading, error } = useAppSelector((state) => state.analytics);

    const [searchParams] = useSearchParams();
    const urlId = searchParams.get('urlId') || '';
    
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const totalPages = Math.ceil((totalCount || 0) / pageSize) || 1;
    
    useEffect(() => {
        if (urlId) {
            dispatch(fetchUrlVisits({ id: urlId, page, pageSize }));
        }
    }, [dispatch, urlId, page, pageSize]);
    
    const handlePageSizeChange = (value: string) => {
        setPageSize(Number(value));
        setPage(1);
    };

    const formatVisitsDate = (isoString: string) => {
        if (!isoString) return "-";
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(date);
    }

    if (isLoading && urlVisits.length === 0) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-destructive py-10">
                Error loading analytics: {error}
            </div>
        );
    }

    if (!isLoading && urlVisits.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                There are no visits yet.
            </div>
        );
    }

    return (
        <Card className="flex flex-col h-full min-h-95 overflow-hidden">
            <CardHeader className="flex items-center justify-between flex-row">
                <CardTitle>Recent Visits</CardTitle>
                <Field orientation="horizontal" className="w-fit">
                    <FieldLabel htmlFor="select-rows-per-page" className="mr-2">Visits per page</FieldLabel>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-20" id="select-rows-per-page">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start">
                            <SelectGroup>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 relative p-0">
                <div className="absolute inset-0 px-6 pb-4 [&>div]:h-full [&>div]:overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                            <TableRow>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Browser</TableHead>
                                <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {urlVisits.map((v, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{v.ipAddress}</TableCell>
                                    <TableCell>{v.country}</TableCell>
                                    <TableCell>{v.browser}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        {formatVisitsDate(v.createdAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-2 bg-card z-20">
                {totalPages > 1 && (
                    <Pagination className="mx-0 w-auto mt-4 justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {generatePagination(page, totalPages).map((p, i) => {
                                if (p === '...') {
                                    return (
                                        <PaginationItem key={`ellipsis-${i}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }

                                return (
                                    <PaginationItem key={p}>
                                        <PaginationLink
                                            isActive={page === p}
                                            onClick={() => setPage(p as number)}
                                            className="cursor-pointer"
                                        >
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </CardFooter>
        </Card>
    );
}