import {useMemo, useState, useEffect} from "react"
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts"

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import {fetchDevicesDailyVisits} from "@/features/dashboard/dashboardSlice.ts";
import type {DeviceVisits} from "@/features/dashboard/types.ts";

export const description = "A stacked bar chart with dynamic data"

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

export function TotalVisitsBarChart() {
    const dispatch = useAppDispatch()
    const {isDevicesDailyVisitsLoading, devicesDailyVisits} = useAppSelector((state) => state.dashboard);
    const [timeRange, setTimeRange] = useState("30d")

    useEffect(() => {
        dispatch(fetchDevicesDailyVisits())
    }, [dispatch])

    const uniqueDeviceTypes = useMemo(() => {
        if (!devicesDailyVisits || devicesDailyVisits.length === 0) return [];

        return Array.from(
            new Set(devicesDailyVisits.flatMap(d => d.deviceVisits?.map(dev => dev.device) || []))
        );
    }, [devicesDailyVisits]);
    
    const chartConfig = useMemo(() => {
        const config: Record<string, { label: string, color?: string }> = {
            visits: {label: "Visits"},
        };

        uniqueDeviceTypes.forEach((device, index) => {
            config[device] = {
                label: device.charAt(0).toUpperCase() + device.slice(1),
                color: CHART_COLORS[index % CHART_COLORS.length]
            };
        });

        return config satisfies ChartConfig;
    }, [uniqueDeviceTypes]);
    
    const {flatData, deviceKeys} = useMemo(() => {
        let daysToSubtract = 30;
        if (timeRange === "14d") {
            daysToSubtract = 14;
        } else if (timeRange === "7d") {
            daysToSubtract = 7;
        }
        
        const visitsMap = new Map<string, DeviceVisits[]>();
        
        if (devicesDailyVisits && devicesDailyVisits.length > 0) {
            devicesDailyVisits.forEach((dayData) => {
                const dateKey = dayData.date.split('T')[0];
                visitsMap.set(dateKey, dayData.deviceVisits || []);
            });
        }

        const filledData = [];
        const keys = new Set<string>();
        const referenceDate = new Date();
        
        for (let i = daysToSubtract - 1; i >= 0; i--) {
            const d = new Date(referenceDate);
            d.setDate(referenceDate.getDate() - i);
            
            const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            
            const flatDay: any = {date: dateString};
            
            const dayDevices = visitsMap.get(dateString) || [];
            
            dayDevices.forEach(dev => {
                flatDay[dev.device] = dev.visits;
                keys.add(dev.device);
            });

            filledData.push(flatDay);
        }

        return {flatData: filledData, deviceKeys: Array.from(keys)};
    }, [devicesDailyVisits, timeRange]);

    return (
        <>
            {
                isDevicesDailyVisitsLoading ? <Skeleton className="flex flex-col h-full"/> :
                    <Card className="flex flex-col h-full">
                        <CardHeader>
                            <CardTitle>Total Visits (Devices)</CardTitle>
                            <CardDescription>
                    <span className="hidden md:block">
                        Total visits broken down by device type
                    </span>
                                <span className="md:hidden">Visits by device</span>
                            </CardDescription>
                            <CardAction>
                                <ToggleGroup
                                    type="single"
                                    value={timeRange}
                                    onValueChange={(val) => {
                                        if (val) setTimeRange(val)
                                    }}
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
                                        aria-label="Select a time range"
                                    >
                                        <SelectValue placeholder="Last 30 days"/>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="30d" className="rounded-lg">
                                            Last 30 days
                                        </SelectItem>
                                        <SelectItem value="14d" className="rounded-lg">
                                            Last 14 days
                                        </SelectItem>
                                        <SelectItem value="7d" className="rounded-lg">
                                            Last 7 days
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="px-2 sm:p-6 flex-1 min-h-0">
                            <div className="relative w-full h-full">
                                {deviceKeys.length > 0 ? (
                                    <ChartContainer
                                        config={chartConfig}
                                        className="absolute inset-0 aspect-auto w-full h-full"
                                    >
                                        <BarChart
                                            accessibilityLayer
                                            data={flatData}
                                            margin={{
                                                left: 12,
                                                right: 12,
                                            }}
                                        >
                                            <CartesianGrid vertical={false}/>
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
                                            {deviceKeys.map((device) => (
                                                <Bar
                                                    key={device}
                                                    dataKey={device}
                                                    stackId="a"
                                                    fill={`var(--color-${device})`}
                                                />
                                            ))}
                                        </BarChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
            }
        </>
    )
}
