import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart.tsx";

const chartData = [
    { device: "Desktop", visits: 120 },
    { device: "Mobile", visits: 98 },
    { device: "Tablet", visits: 40 },
    { device: "Console", visits: 0 },
    { device: "Other", visits: 155 },
];


const chartConfig = {
    visits: {
        label: "Visits",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export function DeviceRadarChart() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>Distribution across platforms</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 w-full pb-2">
                <div className="relative w-full h-full">
                    <ChartContainer
                        config={chartConfig}
                        className="absolute inset-0 mx-auto w-full h-full"
                    >
                        <RadarChart data={chartData}>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <PolarAngleAxis dataKey="device" />
                            <PolarGrid />
                            <Radar
                                dataKey="visits"
                                fill="var(--color-visits)"
                                fillOpacity={0.6}
                            />
                        </RadarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}