'use client'

import { Pie, PieChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from ".@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from ".@/components/ui/card"
import { useEffect, useState } from "react"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "oklch(76.8% 0.233 130.85)"
    },
} satisfies ChartConfig

type BrowserData = {
    browser: string
    uses: number
    fill: string
}

export function BrowserChart({ browsers = ["all"], data = [] }: { browsers: string[], data: BrowserData[] }) {
    const [chartData, setChartData] = useState(data);

    useEffect(() => {
        const filteredData = data.filter((d) => browsers.includes(d.browser));
        setChartData(filteredData);
    }, [browsers]);

    return (
        <Card className="w-full md:w-1/2 lg:w-1/3 bg-zinc-800/60 border-zinc-500 text-white">
            <CardHeader className="flex flex-col border-b-1 border-zinc-500 pb-4 justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Browsers</CardTitle>
                    <CardDescription>showing the total visits by browser</CardDescription>
                </div>
                <small className="text-zinc-400 font-bold">browsers: <span className="text-lime-500">{browsers.map((b) => b).join(", ")}</span></small>
            </CardHeader>
            <CardContent className="w-full">
                <ChartContainer config={chartConfig}>
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel className="text-zinc-200 bg-zinc-800" />}
                        />
                        <Pie data={chartData} nameKey="browser" dataKey="uses" innerRadius={0.5} cx="50%" cy="50%" />
                    </PieChart>
                </ChartContainer>
                <CardFooter className="flex flex-wrap flex-row gap-2 mt-2 justify-center items-center">
                    {browsers.map((b) => {
                        const browserData = data.find((d) => d.browser === b);
                        return (
                            <div key={b} className="flex flex-row gap-1 items-center">
                                <div className="h-2 w-3 rounded" style={{ backgroundColor: browserData ? browserData.fill : '' }} />
                                <span className="text-sm text-zinc-500">{b}</span>
                            </div>
                        );
                    })}
                </CardFooter>
            </CardContent>
        </Card>
    )
}
