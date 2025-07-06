'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const chartConfig = {
    location: {
        label: "Location",
        color: "oklch(76.8% 0.233 130.85)"
    },
} satisfies ChartConfig

const rawData = [
    { city: "Concórdia", country: "Brazil", uses: 125 },
    { city: "São Paulo", country: "Brazil", uses: 128 },
    { city: "Rio de Janeiro", country: "Brazil", uses: 132 },
    { city: "Porto Alegre", country: "Brazil", uses: 130 },
    { city: "Belo Horizonte", country: "Brazil", uses: 127 },
    { city: "Brasília", country: "Brazil", uses: 135 },
]

export default function LocationChart() {
    const [location, setLocation] = useState("country-city")
    const [chartData, setChartData] = useState(() =>
        rawData.map(d => ({
            location: `${d.city} - ${d.country}`,
            uses: d.uses,
        }))
    )

    function handleSetLocation(value: string) {
        setLocation(value);
        let newData: { location: string, uses: number }[] = [];

        switch (value) {
            case 'country-city':
                newData = rawData.map((d) => ({
                    location: `${d.city} (${d.country})`,
                    uses: d.uses,
                }));
                break;

            case 'city':
                newData = rawData.map((d) => ({
                    location: d.city,
                    uses: d.uses,
                }));
                break;

            case 'country': {
                const grouped = rawData.reduce((acc, curr) => {
                    acc[curr.country] = (acc[curr.country] || 0) + curr.uses;
                    return acc;
                }, {} as Record<string, number>);

                newData = Object.entries(grouped).map(([country, uses]) => ({
                    location: country,
                    uses,
                }));
                break;
            }

            default:
                newData = [];
                break;
        }

        setChartData(newData);
    }

    return (
        <Card className="w-full md:w-1/2 lg:w-1/3 bg-zinc-800/60 border-zinc-500 text-white">
            <CardHeader className="flex flex-row border-b-1 border-zinc-500 pb-4 justify-between items-center">
                <div className="flex flex-col gap-2">
                    <CardTitle>Location</CardTitle>
                    <CardDescription>showing visitors estimate location</CardDescription>
                </div>
                <div className="flex flex-row gap-2">
                    <Select onValueChange={handleSetLocation} defaultValue={location}>
                        <SelectTrigger className="border-zinc-500 bg-zinc-800">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-500 bg-zinc-800 text-white">
                            <SelectGroup>
                                <SelectItem className="focus:bg-zinc-500" value="country-city">Country & City</SelectItem>
                                <SelectItem className="focus:bg-zinc-500" value="country">Country</SelectItem>
                                <SelectItem className="focus:bg-zinc-500" value="city">City</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="w-full">
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="uses" />
                        <YAxis
                            dataKey="location"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    color={chartConfig.location.color}
                                    formatter={(value) => `${value} visits`}
                                    className="bg-zinc-800 border-zinc-500"
                                />
                            }
                            labelFormatter={(label) => `users from ${label}`}
                        />
                        <Bar dataKey='uses' type="monotone" fill={chartConfig.location.color} fillOpacity={1} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
