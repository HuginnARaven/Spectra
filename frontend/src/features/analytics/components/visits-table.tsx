import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const visits = [
    { ip: "192.168.1.1", country: "USA", browser: "Chrome", date: "2024-01-24 10:00" },
    { ip: "10.0.0.1", country: "Ukraine", browser: "Firefox", date: "2024-01-24 10:05" },
    { ip: "172.16.0.1", country: "Germany", browser: "Safari", date: "2024-01-24 10:15" },
    // ... more data
];

export function VisitsTable() {
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
                        {visits.map((v, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-medium">{v.ip}</TableCell>
                                <TableCell>{v.country}</TableCell>
                                <TableCell>{v.browser}</TableCell>
                                <TableCell className="text-right">{v.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}