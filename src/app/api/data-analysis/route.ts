import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ValidateToken from "@/lib/auth";
import jwt from "jsonwebtoken";

// Função auxiliar para normalizar nomes de browsers
const browserMap = {
    chrome: "Chrome",
    firefox: "Firefox",
    edge: "Edge",
    safari: "Safari",
    opera: "Opera",
};

const osMap = {
    windows: "Windows",
    linux: "Linux",
    macos: "macOS",
    android: "Android",
    ios: "iOS",
};

function normalizeBrowser(browserRaw: string): string {
    const browser = browserRaw?.toLowerCase() || "";
    for (const key in browserMap) {
        if (browser.includes(key)) return browserMap[key as keyof typeof browserMap];
    }
    return "Other";
}

function normalizeOs(browserRaw: string): string {
    const os = browserRaw?.toLowerCase() || "";
    for (const key in osMap) {
        if (os.includes(key)) return osMap[key as keyof typeof osMap];
    }
    return "Other";
}

export async function POST(req: Request) {
    const validToken = await ValidateToken(req.headers.get("Authorization") || "");
    if (!validToken.valid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { period, type, browsers, location, slug, os } = await req.json();

    if (!period || !type || !browsers || !location || !os) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        const startDate = new Date();
        switch (period) {
            case "30d":
                startDate.setDate(startDate.getDate() - 30);
                break;
            case "15d":
                startDate.setDate(startDate.getDate() - 15);
                break;
            case "5d":
                startDate.setDate(startDate.getDate() - 5);
                break;
        }

        const endDate = new Date();

        // Filtro de location
        let locationFilter = {};
        if (location === "country-city") {
            locationFilter = {
                city: { notIn: ["unknown"] },
                country: { notIn: ["unknown"] },
            };
        } else if (location === "country") {
            locationFilter = {
                country: { notIn: ["unknown"] },
            };
        } else if (location === "city") {
            locationFilter = {
                city: { notIn: ["unknown"] },
            };
        }

        // Filtro de device
        const deviceFilter = type === "all" ? {} : { device: type };
        const authorizationHeader = req.headers.get("Authorization") || "";
        const token = jwt.decode(authorizationHeader as string) as { id: string } | null;

        if (!token) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // filtro de slug
        let filters = {};
        if(slug) {
            const slugLinkID = await prisma.shortUrl.findFirst({
                where: { slug, userId: token.id },
                select: { id: true }
            });
            if (!slugLinkID) {
                return NextResponse.json({ error: "Link not found" }, { status: 404 });
            }
            filters = { 
                shortUrlId: slugLinkID.id,
                ownerId: token.id,
                accessedAt: {
                    gte: startDate,
                    lte: endDate,
                },
                browser: {
                    not: 'unknown',
                },
                os: {
                    not: 'unknown',
                },
                ...deviceFilter,
                ...locationFilter,
            };
        } else {
            filters = {
                ownerId: token.id,
                accessedAt: {
                    gte: startDate,
                    lte: endDate,
                },
                browser: {
                    not: 'unknown',
                },
                os: {
                    not: 'unknown',
                },
                ...deviceFilter,
                ...locationFilter,
            }
        }

        const rawAccesses = await prisma.dataAnalytics.findMany({
            where: {
                ...filters
            },
            select: {
                accessedAt: true,
                device: true,
                browser: true,
                city: true,
                country: true,
                os: true,
            },
            orderBy: {
                accessedAt: "asc",
            }
        });

        // -----------------------------
        // Access Chart (por data e tipo)
        // -----------------------------
        const accessChartMap: Record<string, { desktop: number; mobile: number }> = {};

        for (const access of rawAccesses) {
            const dateKey = access.accessedAt.toISOString().split("T")[0];

            if (!accessChartMap[dateKey]) {
                accessChartMap[dateKey] = { desktop: 0, mobile: 0 };
            }

            if (access.device === "desktop") {
                accessChartMap[dateKey].desktop += 1;
            } else if (access.device === "mobile") {
                accessChartMap[dateKey].mobile += 1;
            }
        }

        const accessChart = Object.entries(accessChartMap).map(([date, counts]) => ({
            date,
            ...counts,
        }));

        // -----------------------------
        // Browser Chart
        // -----------------------------
        const browserChartMap: Record<string, number> = {};

        for (const access of rawAccesses) {
            const browser = normalizeBrowser(access.browser);
            // Debug console para ver o browser e lista filtrada (remover depois)
            // console.log("Access browser normalized:", browser, "Included browsers:", browsers);

            console.log(browsers)
            if (!browsers.includes(browser)) continue;  // Se não está no filtro, pula

            browserChartMap[browser] = (browserChartMap[browser] || 0) + 1;
        }

        const browserColors = [
            "oklch(80.8% 0.233 130.85)",
            "oklch(76.8% 0.233 130.85)",
            "oklch(72.8% 0.233 130.85)",
            "oklch(68.8% 0.233 130.85)",
            "oklch(58.8% 0.233 130.85)",
            "oklch(48.8% 0.233 130.85)",
        ];

        const browserChart = Object.entries(browserChartMap).map(([browser, uses], idx) => ({
            browser,
            uses,
            fill: browserColors[idx % browserColors.length],
        }));
        
        // -----------------------------
        // OS Chart
        // -----------------------------
        const OsChartMap: Record<string, number> = {};

        for (const access of rawAccesses) {
            const Os = normalizeOs(access.os);
            // Debug console para ver o Os e lista filtrada (remover depois)
            // console.log("Access Os normalized:", Os, "Included Oss:", Oss);

            console.log(Os)
            if (!Os.includes(Os)) continue;  // Se não está no filtro, pula

            OsChartMap[Os] = (OsChartMap[Os] || 0) + 1;
        }

        const OsColors = [
            "oklch(80.8% 0.233 130.85)",
            "oklch(76.8% 0.233 130.85)",
            "oklch(72.8% 0.233 130.85)",
            "oklch(68.8% 0.233 130.85)",
        ];

        const osChart = Object.entries(OsChartMap).map(([Os, uses], idx) => ({
            Os,
            uses,
            fill: OsColors[idx % OsColors.length],
        }));

        console.log(OsChartMap);

        // -----------------------------
        // Location Chart
        // -----------------------------
        const locationMap: Record<string, { city: string; country: string; uses: number }> = {};

        for (const access of rawAccesses) {
            const key = `${access.city}-${access.country}`;
            if (!locationMap[key]) {
                locationMap[key] = {
                    city: access.city || "Unknown",
                    country: access.country || "Unknown",
                    uses: 0,
                };
            }
            locationMap[key].uses += 1;
        }

        const locationChart = Object.values(locationMap)
  .sort((a, b) => b.uses - a.uses)
  .slice(0, 5);

        return NextResponse.json(
            {
                accessChart,
                browserChart,
                locationChart, // agora só os 5 mais acessados
                osChart
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
