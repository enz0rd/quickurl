'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "oklch(76.8% 0.233 130.85)"
    },
} satisfies ChartConfig


const data = [
    { date: "2025-06-28", desktop: 125, mobile: 100 },
    { date: "2025-06-29", desktop: 128, mobile: 102 },
    { date: "2025-06-30", desktop: 132, mobile: 105 },
    { date: "2025-06-31", desktop: 130, mobile: 104 },
    { date: "2025-07-01", desktop: 127, mobile: 101 },
    { date: "2025-07-02", desktop: 135, mobile: 110 },
    { date: "2025-07-03", desktop: 133, mobile: 108 },
    { date: "2025-07-04", desktop: 130, mobile: 106 },
    { date: "2025-07-05", desktop: 129, mobile: 105 },
    { date: "2025-07-06", desktop: 134, mobile: 109 },
    { date: "2025-07-07", desktop: 132, mobile: 107 },
    { date: "2025-07-08", desktop: 130, mobile: 106 },
    { date: "2025-07-09", desktop: 128, mobile: 104 },
    { date: "2025-07-10", desktop: 126, mobile: 102 },
    { date: "2025-07-11", desktop: 129, mobile: 105 },
    { date: "2025-07-12", desktop: 131, mobile: 107 },
    { date: "2025-07-13", desktop: 134, mobile: 110 },
    { date: "2025-07-14", desktop: 132, mobile: 108 },
    { date: "2025-07-15", desktop: 130, mobile: 106 },
    { date: "2025-07-16", desktop: 128, mobile: 104 },
    { date: "2025-07-17", desktop: 127, mobile: 103 },
    { date: "2025-07-18", desktop: 129, mobile: 105 },
    { date: "2025-07-19", desktop: 131, mobile: 107 },
    { date: "2025-07-20", desktop: 133, mobile: 109 },
    { date: "2025-07-21", desktop: 132, mobile: 108 },
    { date: "2025-07-22", desktop: 130, mobile: 106 },
    { date: "2025-07-23", desktop: 128, mobile: 104 },
    { date: "2025-07-24", desktop: 127, mobile: 103 },
    { date: "2025-07-25", desktop: 129, mobile: 105 },
    { date: "2025-07-26", desktop: 131, mobile: 107 },
]

export function AccessChart() {
    const [period, setPeriod] = useState('30d')
    const [type, setType] = useState("all")
    const [chartData, setChartData] = useState(data)

    function handlePeriodChange(value: string) {
        setPeriod(value);
        switch (value) {
            case '30d':
                setChartData(data.slice(-30))
                break
            case '15d':
                setChartData(data.slice(-15))
                break
            case '5d':
                setChartData(data.slice(-5))
                break
        }
    }

    return (
        <Card className="w-full md:w-1/2 lg:w-1/3 bg-zinc-800/60 border-zinc-500 text-white">
            <CardHeader className="flex flex-row border-b-1 border-zinc-500 pb-4 justify-between items-center">
                <div className="flex flex-col gap-2">
                    <CardTitle>Visitors</CardTitle>
                    <CardDescription>showing the total visitors for the last</CardDescription>
                </div>
                <div className="flex flex-row gap-2">

                    <Select onValueChange={handlePeriodChange} defaultValue={period}>
                        <SelectTrigger className="border-zinc-500 bg-zinc-800">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-500 bg-zinc-800 text-white">
                            <SelectGroup>
                                <SelectItem className="focus:bg-zinc-500" value="30d">30 days</SelectItem>
                                <SelectItem className="focus:bg-zinc-500" value="15d">15 days</SelectItem>
                                <SelectItem className="focus:bg-zinc-500" value="5d">5 days</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(e: string) => setType(e)} defaultValue={type}>
                        <SelectTrigger className="border-zinc-500 bg-zinc-800">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-500 bg-zinc-800 text-white">
                            <SelectGroup>
                                <SelectItem className="focus:bg-zinc-500" value="all">all</SelectItem>
                                <SelectItem className="focus:bg-zinc-500" value="mobile">mobile</SelectItem>
                                <SelectItem className="focus:bg-zinc-500" value="desktop">desktop</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
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
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <YAxis
                            dataKey={"desktop"}
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
                                type={"natural"}
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
