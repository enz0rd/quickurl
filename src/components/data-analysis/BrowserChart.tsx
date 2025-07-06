'use client'

import { Pie, PieChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { useState } from "react"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "oklch(76.8% 0.233 130.85)"
    },
} satisfies ChartConfig


const data = [
    { uses: 7, browser: "Chrome", fill: "oklch(90% 0.18 130.85)" }, // lighter
    { uses: 3, browser: "Firefox", fill: "oklch(85% 0.2 130.85" },
    { uses: 9, browser: "Edge", fill: "oklch(76.8% 0.233 130.85)" }, // base
    { uses: 2, browser: "Safari", fill: "oklch(65% 0.2 130.85" },
    { uses: 5, browser: "Other", fill: "oklch(50% 0.2 130.85" }, // darker
]

export function BrowserChart() {
    const allBrowsers = data.map((d) => d.browser);
    const [browser, setBrowser] = useState<string[]>(allBrowsers);
    const [chartData, setChartData] = useState(data);

    function handleChangeBrowser(value: string) {
        if (value === "all") {
            setBrowser(allBrowsers);
            setChartData(data);
            return;
        }

        if (browser.includes(value)) {
            if(browser.length === 1) {
                return
            }
            const newBrowsers = browser.filter((b) => b !== value);
            setBrowser(newBrowsers);
            setChartData(data.filter((d) => newBrowsers.includes(d.browser)));
        } else {
            const newBrowsers = [...browser, value];
            setBrowser(newBrowsers);
            setChartData(data.filter((d) => newBrowsers.includes(d.browser)));
        }
    }

    return (
        <Card className="w-full md:w-1/2 lg:w-1/3 bg-zinc-800/60 border-zinc-500 text-white">
            <CardHeader className="flex flex-row border-b-1 border-zinc-500 pb-4 justify-between items-center">
                <div className="flex flex-col gap-2">
                    <CardTitle>Browsers</CardTitle>
                    <CardDescription>showing the total browser used by visitors for the last</CardDescription>
                </div>
                <div className="flex flex-row gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="border-zinc-500 flex flex-row items-center p-2 rounded-lg border-1 gap-1 bg-zinc-800">
                            <span className="text-sm">Browsers</span>
                            <ChevronDown className="w-4 h-4 text-zinc-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="border-zinc-500 bg-zinc-800 text-white">
                            <DropdownMenuLabel className="px-2">Browsers</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="focus:bg-zinc-500" onClick={() => handleChangeBrowser('all')} >all</DropdownMenuItem>
                            {data.map((d) => {
                                return <DropdownMenuCheckboxItem
                                    className="focus:bg-zinc-500"
                                    checked={browser.includes(d.browser)}
                                    key={d.browser}
                                    onCheckedChange={() => handleChangeBrowser(d.browser)}>
                                    {d.browser}
                                </DropdownMenuCheckboxItem>
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="w-full">
                <ChartContainer config={chartConfig}>
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel className="text-zinc-200 bg-zinc-800"/>}
                        />
                        <Pie data={chartData} nameKey="browser" dataKey="uses" innerRadius={0.5} cx="50%" cy="50%" />
                    </PieChart>
                </ChartContainer>
                <CardFooter className="flex flex-wrap flex-row gap-2 mt-2 justify-center items-center">
                    {browser.map((b) => {
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
