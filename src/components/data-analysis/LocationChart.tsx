'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

const chartConfig = {
    location: {
        label: "Location",
        color: "oklch(76.8% 0.233 130.85)"
    },
} satisfies ChartConfig

type LocationData = {
    city: string
    country: string
    uses: number
}

export default function LocationChart({ location = "country-city", data = [] }: { location?: string, data: LocationData[] }) {
    // const [location, setLocation] = useState("country-city")
    const [chartData, setChartData] = useState(() =>
        data.map(d => ({
            location: `${d.city} - ${d.country}`,
            uses: d.uses,
        }))
    )

    const filterSpan = location === 'country-city' ? 'country and city' : location === 'city' ? 'city' : 'country'

    useEffect(() => {
        handleSetLocation(location)
    }, [location])

    function handleSetLocation(value: string) {
        // setLocation(value);
        let newData: { location: string, uses: number }[] = [];

        switch (value) {
            case 'country-city':
                newData = data.map((d) => ({
                    location: `${d.city} (${d.country})`,
                    uses: d.uses,
                }));
                break;

            case 'city':
                newData = data.map((d) => ({
                    location: d.city,
                    uses: d.uses,
                }));
                break;

            case 'country': {
                const grouped = data.reduce((acc, curr) => {
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
            <CardHeader className="flex flex-col gap-2 border-b-1 border-zinc-500 pb-4 justify-between">
                <CardTitle>Location</CardTitle>
                <CardDescription>showing visitors estimate location</CardDescription>
                <small className="text-zinc-400 font-bold">filtered by: <span className="text-lime-500">{filterSpan}</span></small>
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
                            tickMargin={2}
                            width={100}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    color={chartConfig.location.color}
                                    formatter={(value: string) => `${value} visits`}
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
