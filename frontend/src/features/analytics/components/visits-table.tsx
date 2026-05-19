import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import { useSearchParams } from 'react-router-dom';
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import {fetchUrlVisits} from "@/features/analytics/analyticsSlice.ts";

export function VisitsTable() {
    const dispatch = useAppDispatch();
    const { urlVisits, isLoading, error } = useAppSelector((state) => state.analytics);
    
    const [searchParams] = useSearchParams();
    const urlId  = searchParams.get('urlId') || '';
    
    if(urlId !== ''){
        useEffect(() => {
            dispatch(fetchUrlVisits({id: urlId, page: 1, pageSize: 100}));
        }, [dispatch]);
    }

    if (isLoading) {
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

    if (urlVisits.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                There are no visits yet.
            </div>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Visits</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
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
                                <TableCell className="text-right">{v.createdAt}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}