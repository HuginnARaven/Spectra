import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, CartesianGrid, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart.tsx";

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
                            data={chartData}
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
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="visits" fill="var(--color-visits)" radius={8}>
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