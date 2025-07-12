'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from ".@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from ".@/components/ui/card"
import { useEffect, useState } from "react"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "oklch(76.8% 0.233 130.85)"
    },
} satisfies ChartConfig

type AccessData = {
    date: string
    desktop: number
    mobile: number
}

type AccessChartProps = {
    type?: "all" | "desktop" | "mobile"
    period?: "30d" | "15d" | "5d"
    data?: AccessData[]
}

export function AccessChart({ type = "all", period = "30d", data = [] }: AccessChartProps) {
    const [chartData, setChartData] = useState(data)

    useEffect(() => {
        handlePeriodChange(period, data);
    }, [period, data]);

    const [label, setLabel] = useState("30 days");

    function handlePeriodChange(value: string, fullData: AccessData[]) {
        switch (value) {
            case '30d':
                setChartData(fullData.slice(-30));
                setLabel('30 days');
                break;
            case '15d':
                setChartData(fullData.slice(-15));
                setLabel('15 days');
                break;
            case '5d':
                setChartData(fullData.slice(-5));
                setLabel('5 days');
                break;
            default:
                setChartData(fullData);
        }
    }


    return (
        <Card className="w-full md:w-1/2 lg:w-1/3 bg-zinc-800/60 border-zinc-500 text-white">
            <CardHeader className="flex flex-col gap-2 border-b-1 border-zinc-500 pb-4 justify-between">
                <CardTitle>Visitors</CardTitle>
                <CardDescription>showing the total visitors</CardDescription>
                <div className="flex flex-row gap-2">
                    <small className="text-zinc-400 font-bold">device type: <span className="text-lime-500">{type}</span></small>
                    <small className="text-zinc-400 font-bold">period: <span className="text-lime-500">last {label}</span></small>
                </div>
            </CardHeader>
            <CardContent className="w-full">
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 0,
                            right: 0,
                        }}>
                        <defs>
                            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="oklch(76.8% 0.233 130.85)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="oklch(76.8% 0.233 130.85)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="oklch(89.7% 0.196 126.665)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="oklch(89.7% 0.196 126.665)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                                const date = new Date(`${value}T12:00:00`);
                                return isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                            }}
                        />
                        <YAxis
                            dataKey={type === "desktop" ? "desktop" : type === "mobile" ? "mobile" : undefined}
                            tickLine={false}
                            axisLine={true}
                            tickMargin={8}
                            tickCount={7}
                            tickFormatter={(value) => `${value}`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line"
                                className="text-zinc-200 bg-zinc-800" />}
                        />
                        {(type === "all" || type === "desktop") && (
                            <Area
                                dataKey={"desktop"}
                                type={"bump"}
                                fill="url(#fillDesktop)"
                                fillOpacity={0.4}
                                stroke="oklch(76.8% 0.233 130.85)"
                                name="Desktop"
                            />
                        )}
                        {(type === "all" || type === "mobile") && (
                            <Area
                                dataKey={"mobile"}
                                type={"natural"}
                                fill="url(#fillMobile)"
                                fillOpacity={0.4}
                                stroke="oklch(89.7% 0.196 126.665)"
                                name="Mobile"
                            />
                        )}
                    </AreaChart>
                </ChartContainer>
                <CardFooter className="flex flex-row gap-2 mt-2 justify-center items-center">
                    {(type === "all" || type === "desktop") && (
                        <>
                            <div className="w-3 h-2 rounded bg-lime-500" />
                            <span className="text-sm text-zinc-500">desktop</span>
                        </>
                    )}
                    {(type === "all" || type === "mobile") && (
                        <>
                            <div className="w-3 h-2 rounded bg-lime-300" />
                            <span className="text-sm text-zinc-500">mobile</span>
                        </>
                    )}

                </CardFooter>
            </CardContent>
        </Card>
    )
}
