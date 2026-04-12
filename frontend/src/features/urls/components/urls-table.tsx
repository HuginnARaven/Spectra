import { useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { UrlActionsMenu } from "./url-actions-menu";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchUrls } from "../urlsSlice";
import { toast } from "sonner";

export function UrlsTable() {
    const dispatch = useAppDispatch();
    const { urls, isLoading, error } = useAppSelector((state) => state.urls);

    useEffect(() => {
        dispatch(fetchUrls());
    }, [dispatch]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

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
                Error loading URLs: {error}
            </div>
        );
    }

    if (urls.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                No URLs created yet.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[300px]">Original URL</TableHead>
                    <TableHead>Short URL</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {urls.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                                <span className="max-w-[250px] truncate" title={row.originalUrl}>
                                    {row.originalUrl}
                                </span>
                                <a
                                    href={row.originalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-muted-foreground hover:text-primary"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center space-x-2">
                                <span className="text-blue-500 font-medium">{row.shortUrl}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleCopy(row.shortUrl)}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </TableCell>
                        <TableCell>{new Date(row.createdAt).toUTCString()}</TableCell>
                        <TableCell className="text-right">
                            <UrlActionsMenu urlId={row.id} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
