import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { UrlActionsMenu } from "./url-actions-menu";


type UrlData = {
    id: string;
    originalUrl: string;
    shortUrl: string;
    shortCode: string;
    createdAt: string;
}

const tmpData: UrlData[] = [
    {
        "id": "cd386f2e-10d9-45b5-9706-28d64de80748",
        "originalUrl": "https://stackoverflow.com/questions/43447688/setting-up-swagger-asp-net-core-using-the-authorization-headers-bearer",
        "shortUrl": "http://localhost:8080/7aAvxTL",
        "shortCode": "7aAvxTL",
        "createdAt": "2026-01-05T21:23:46.268453Z"
    },
    {
        "id": "66a3d807-5bda-4a4d-a8ed-5d4bf61a373c",
        "originalUrl": "https://stackoverflow.com/",
        "shortUrl": "http://localhost:8080/kVfiwU4",
        "shortCode": "kVfiwU4",
        "createdAt": "2026-01-05T21:23:52.788905Z"
    },
    {
        "id": "23e61fe8-6777-4998-b0b0-6296aa780af2",
        "originalUrl": "https://leetcode.com/studyplan/top-interview-150/",
        "shortUrl": "http://localhost:8080/AzS8TAr",
        "shortCode": "AzS8TAr",
        "createdAt": "2026-01-05T21:24:09.955684Z"
    },
    {
        "id": "ceb31f13-031e-460e-8a9b-7cc5d5707db5",
        "originalUrl": "https://openai.com/index/openai-codex/",
        "shortUrl": "http://localhost:8080/GKrSq6q",
        "shortCode": "GKrSq6q",
        "createdAt": "2026-01-11T12:09:36.687482Z"
    },
    {
        "id": "d36700ac-97a7-4da4-8c0b-eb1757a7bcac",
        "originalUrl": "http://localhost:8080/swagger/index.html",
        "shortUrl": "http://localhost:8080/gLBV5Xg",
        "shortCode": "gLBV5Xg",
        "createdAt": "2026-01-12T16:35:13.557207Z"
    }
];

export function UrlsTable() {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // Тут можна додати toast notification "Copied!"
    };

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
                {tmpData.map((row) => (
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