import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, PieChart, Pie, LabelList} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart.tsx";
import {useAppSelector} from "@/app/hooks.ts";

const chartData = [
    { device: "Desktop", visits: 160 },
    { device: "Mobile", visits: 98 },
    { device: "Tablet", visits: 40 },
    { device: "Console", visits: 10 },
    { device: "Other", visits: 110 },
];


const chartConfig = {
    visits: {
        label: "Visits",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export function DeviceRadarChart() {
    const { deviceDistribution } = useAppSelector((state) => state.analytics.urlAnalyticsData);
    const data = deviceDistribution.length > 0 ? deviceDistribution : chartData
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
                        {data.length > 2 ?                         
                            <RadarChart data={data}>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <PolarAngleAxis dataKey="device" />
                            <PolarGrid />
                            <Radar
                                dataKey="visits"
                                fill="var(--color-visits)"
                                fillOpacity={0.6}
                            />
                        </RadarChart>
                        :
                            <PieChart>
                                <ChartTooltip
                                    content={<ChartTooltipContent nameKey="visits" hideLabel />}
                                />
                                <Pie data={data} dataKey="visits" label nameKey="visits" fill="var(--color-visits)">
                                    <LabelList
                                        dataKey="device"
                                        className="fill-background"
                                        stroke="none"
                                        fontSize={12}
                                    />
                                </Pie>
                            </PieChart>
                        }
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}