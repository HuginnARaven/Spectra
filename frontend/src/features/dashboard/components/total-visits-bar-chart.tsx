import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const description = "A stacked bar chart with dynamic data"

export interface DeviceVisit {
    deviceType: string;
    visits: number;
}

export interface DailyVisitsData {
    date: string;
    devices: DeviceVisit[];
}

const generateMockData = (): DailyVisitsData[] => {
    const data: DailyVisitsData[] = [];
    const today = new Date();
    const deviceTypes = ["desktop", "mobile", "tv", "tablet", "unknown"];
    
    let seed = 42;
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        const numDevices = Math.floor(random() * 3) + 2; 
        const shuffled = [...deviceTypes].sort(() => 0.5 - random());
        const dayDevices = shuffled.slice(0, numDevices);
        
        const devices: DeviceVisit[] = dayDevices.map(type => ({
            deviceType: type,
            visits: Math.floor(random() * 400) + 100
        }));

        data.push({
            date: dateString,
            devices
        });
    }
    return data;
};

const rawMockData = generateMockData();

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

const uniqueDeviceTypes = Array.from(new Set(rawMockData.flatMap(d => d.devices.map(dev => dev.deviceType))));

const chartConfig = {
    visits: { label: "Visits" },
    ...uniqueDeviceTypes.reduce((config, device, index) => {
        config[device as keyof typeof config] = {
            label: device.charAt(0).toUpperCase() + device.slice(1),
            color: CHART_COLORS[index % CHART_COLORS.length]
        };
        return config;
    }, {} as Record<string, { label: string, color: string }>)
} satisfies ChartConfig;

export function TotalVisitsBarChart() {
    const [timeRange, setTimeRange] = useState("30d")

    const { flatData, deviceKeys } = useMemo(() => {
        let daysToSubtract = 30;
        if (timeRange === "14d") daysToSubtract = 14;
        else if (timeRange === "7d") daysToSubtract = 7;

        const filteredData = rawMockData.slice(-daysToSubtract);
        
        const keys = new Set<string>();
        const mappedData = filteredData.map(dayData => {
            const flatDay: any = { date: dayData.date };
            dayData.devices.forEach(dev => {
                flatDay[dev.deviceType] = dev.visits;
                keys.add(dev.deviceType);
            });
            return flatDay;
        });

        return { flatData: mappedData, deviceKeys: Array.from(keys) };
    }, [timeRange]);

    return (
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
                        onValueChange={(val) => { if (val) setTimeRange(val) }}
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
                            <SelectValue placeholder="Last 30 days" />
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
                </div>
            </CardContent>
        </Card>
    )
}
