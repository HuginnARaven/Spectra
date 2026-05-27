import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { XAxis, CartesianGrid, Line, LineChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart.tsx";
import {useAppSelector} from "@/app/hooks.ts";
import { useMemo, useState } from "react";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const chartData = [
    { date: "2024-04-01", visits: 222},
    { date: "2024-04-02", visits: 97},
    { date: "2024-04-03", visits: 167},
    { date: "2024-04-04", visits: 242},
    { date: "2024-04-05", visits: 373},
    { date: "2024-04-06", visits: 301},
    { date: "2024-04-07", visits: 245},
    { date: "2024-04-08", visits: 409},
    { date: "2024-04-09", visits: 59},
    { date: "2024-04-10", visits: 261},
    { date: "2024-04-11", visits: 327},
    { date: "2024-04-12", visits: 292},
    { date: "2024-04-13", visits: 342},
    { date: "2024-04-14", visits: 137},
    { date: "2024-04-15", visits: 120},
    { date: "2024-04-16", visits: 138},
    { date: "2024-04-17", visits: 446},
    { date: "2024-04-18", visits: 364},
    { date: "2024-04-19", visits: 243},
    { date: "2024-04-20", visits: 89},
    { date: "2024-04-21", visits: 137},
    { date: "2024-04-22", visits: 224},
    { date: "2024-04-23", visits: 138},
    { date: "2024-04-24", visits: 387},
    { date: "2024-04-25", visits: 215},
    { date: "2024-04-26", visits: 75},
    { date: "2024-04-27", visits: 383},
    { date: "2024-04-28", visits: 122},
    { date: "2024-04-29", visits: 315},
    { date: "2024-04-30", visits: 454},
    { date: "2024-05-01", visits: 165},
    { date: "2024-05-02", visits: 293},
    { date: "2024-05-03", visits: 247},
    { date: "2024-05-04", visits: 385},
    { date: "2024-05-05", visits: 481},
    { date: "2024-05-06", visits: 498},
    { date: "2024-05-07", visits: 388},
    { date: "2024-05-08", visits: 149},
    { date: "2024-05-09", visits: 227},
    { date: "2024-05-10", visits: 293},
    { date: "2024-05-11", visits: 335},
    { date: "2024-05-12", visits: 197},
    { date: "2024-05-13", visits: 197},
    { date: "2024-05-14", visits: 448},
    { date: "2024-05-15", visits: 473},
    { date: "2024-05-16", visits: 338},
    { date: "2024-05-17", visits: 499},
    { date: "2024-05-18", visits: 315},
    { date: "2024-05-19", visits: 235},
    { date: "2024-05-20", visits: 177},
    { date: "2024-05-21", visits: 82},
    { date: "2024-05-22", visits: 81},
    { date: "2024-05-23", visits: 252},
    { date: "2024-05-24", visits: 294},
    { date: "2024-05-25", visits: 201},
    { date: "2024-05-26", visits: 213},
    { date: "2024-05-27", visits: 420},
    { date: "2024-05-28", visits: 233},
    { date: "2024-05-29", visits: 78},
    { date: "2024-05-30", visits: 340},
    { date: "2024-05-31", visits: 178},
    { date: "2024-06-01", visits: 178},
    { date: "2024-06-02", visits: 470},
    { date: "2024-06-03", visits: 103},
    { date: "2024-06-04", visits: 439},
    { date: "2024-06-05", visits: 88},
    { date: "2024-06-06", visits: 294},
    { date: "2024-06-07", visits: 323},
    { date: "2024-06-08", visits: 385},
    { date: "2024-06-09", visits: 438},
    { date: "2024-06-10", visits: 155},
    { date: "2024-06-11", visits: 92},
    { date: "2024-06-12", visits: 492},
    { date: "2024-06-13", visits: 81},
    { date: "2024-06-14", visits: 426},
    { date: "2024-06-15", visits: 307},
    { date: "2024-06-16", visits: 371},
    { date: "2024-06-17", visits: 475},
    { date: "2024-06-18", visits: 107},
    { date: "2024-06-19", visits: 341},
    { date: "2024-06-20", visits: 408},
    { date: "2024-06-21", visits: 169},
    { date: "2024-06-22", visits: 317},
    { date: "2024-06-23", visits: 480},
    { date: "2024-06-24", visits: 132},
    { date: "2024-06-25", visits: 141},
    { date: "2024-06-26", visits: 434},
    { date: "2024-06-27", visits: 448},
    { date: "2024-06-28", visits: 149},
    { date: "2024-06-29", visits: 103},
    { date: "2024-06-30", visits: 446},
]


const chartConfig = {
    visits: {
        label: "Url Visits",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export function VisitsLineChart() {
    const { last30DaysVisits } = useAppSelector((state) => state.analytics.urlAnalyticsData);
    const [timeRange, setTimeRange] = useState("30d")

    const completeChartData = useMemo(() => {
        let daysToSubtract = 30;
        if (timeRange === "14d") {
            daysToSubtract = 14;
        } else if (timeRange === "7d") {
            daysToSubtract = 7;
        }

        const referenceDate = new Date();

        const filledData = [];

        const visitsMap = new Map();
        last30DaysVisits.forEach((item) => {
            const dateKey = item.date.split('T')[0];
            visitsMap.set(dateKey, item.visits);
        });

        for (let i = daysToSubtract - 1; i >= 0; i--) {
            const d = new Date(referenceDate);
            d.setDate(referenceDate.getDate() - i);

            const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            filledData.push({
                date: dateString,
                visits: visitsMap.get(dateString) || 0,
            });
        }

        return filledData;
    }, [last30DaysVisits, timeRange]);
    
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Total Visits</CardTitle>
                <CardDescription>
                    <span className="hidden md:block">
                        Total for the last 30 days
                    </span>
                    <span className="md:hidden">Last 30 days</span>
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:px-4! md:flex"
                    >
                        <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                        <ToggleGroupItem value="14d">Last 14 days</ToggleGroupItem>
                        <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate md:hidden"
                            size="sm"
                            aria-label="Select a value"
                        >
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="14d" className="rounded-lg">
                                Last 14 days
                            </SelectItem>
                            <SelectItem value="14d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className="px-2 sm:p-6 flex-1 min-h-0">
                <div className="relative w-full h-full">
                <ChartContainer
                    config={chartConfig}
                    className="absolute inset-0 aspect-auto w-full h-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={last30DaysVisits?.length > 0 ? completeChartData : chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="visits"
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }}
                                />
                            }
                        />
                        <Line
                            dataKey="visits"
                            type="monotone"
                            stroke="var(--color-visits)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}