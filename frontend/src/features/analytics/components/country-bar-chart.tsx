import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, CartesianGrid, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart.tsx";
import {useAppSelector} from "@/app/hooks.ts";
import { useMemo } from "react";

const chartData = [
    { country: "USA", visits: 1200 },
    { country: "Ukraine", visits: 900 },
    { country: "Germany", visits: 400 },
    { country: "Poland", visits: 300 },
    { country: "France", visits: 200 },
];


const chartConfig = {
    visits: {
        label: "Url Visits",
        color: "var(--primary)",
    },
    label: {
        color: "var(--background)",
    },
} satisfies ChartConfig


export function CountryBarChart() {
    const { topCountries } = useAppSelector((state) => state.analytics.urlAnalyticsData);

    const processedChartData = useMemo(() => {
        const rawData = topCountries.length > 0 ? topCountries : chartData;
        
        if (rawData.length <= 5) {
            return rawData;
        }
        
        const top5 = rawData.slice(0, 5);
        
        const others = rawData.slice(5);
        const othersVisits = others.reduce((sum, item) => sum + item.visits, 0);
        
        return [
            ...top5,
            { country: "Other", visits: othersVisits }
        ];
    }, [topCountries]);
    
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Visits by Country</CardTitle>
                <CardDescription>Top 5 countries performing well</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 w-full pb-2">
                <div className="relative w-full h-full">
                    <ChartContainer config={chartConfig} className="absolute inset-0 w-full h-full">
                        <BarChart
                            accessibilityLayer
                            data={processedChartData}
                            margin={{
                                top: 30,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="country"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                minTickGap={32}
                                interval={0}
                                tickFormatter={(value) => {
                                    return value.length > 10 ? `${value.substring(0, 10)}...` : value;
                                }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="visits" fill="var(--color-visits)" radius={8} maxBarSize={150}>
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}