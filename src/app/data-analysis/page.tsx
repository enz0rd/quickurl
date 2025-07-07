"use client";
import React, { useEffect, useState } from "react";
import Header from "../header";
import FooterInfo from "@/components/FooterInfo";
import { ChevronDown, Filter, Loader, RefreshCcwIcon } from "lucide-react";
import { AccessChart } from "@/components/data-analysis/AccessChart";
import { BrowserChart } from "@/components/data-analysis/BrowserChart";
import LocationChart from "@/components/data-analysis/LocationChart";
import { Select, SelectGroup, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { OsChart } from "@/components/data-analysis/OsChart";

type GraphsFilters = {
  slug: string;
  access: {
    last: '30d' | '15d' | '5d';
    type: 'all' | 'mobile' | 'desktop';
  };
  browser: string[];
  location: string;
  os: string[];
};

type AccessData = { date: string; desktop: number; mobile: number; };
type BrowserData = { browser: string; uses: number; fill: string; };
type OsData = { Os: string; uses: number; fill: string; };
type LocationData = { city: string; country: string; uses: number; };

type FetchedData = {
  accessChart: AccessData[];
  browserChart: BrowserData[];
  locationChart: LocationData[];
  osChart: OsData[];
};

function getDefaultFilters(data: FetchedData, slug: string = ""): GraphsFilters {
  return {
    slug,
    access: { last: "30d", type: "all" },
    browser: Array.isArray(data?.browserChart) ? data.browserChart.map((d) => d.browser) : [],
    location: "country-city",
    os: Array.isArray(data?.osChart) ? data.osChart.map((d) => d.Os) : [],
  };
}

const browserOptions = [
  "Chrome",
  "Firefox",
  "Safari",
  "Opera",
  "Edge",
  "Other",
];

const osOptions = [
  "Windows",
  "Linux",
  "macOS",
  "iOS",
  "Android",
  "Other",
];

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");
  const [chartsData, setChartsData] = useState<FetchedData>({
    accessChart: [],
    browserChart: [],
    locationChart: [],
    osChart: [],
  });

  const [graphsFilters, setGraphsFilters] = useState(() => getDefaultFilters({
    accessChart: [],
    browserChart: [],
    locationChart: [],
    osChart: [],
  }, slug));
  const [filtersBeforeFetch, setFiltersBeforeFetch] = useState(() => getDefaultFilters({
    accessChart: [],
    browserChart: [],
    locationChart: [],
    osChart: [],
  }, slug));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const validPeriods = ["30d", "15d", "5d"];
      const validDevices = ["desktop", "mobile", "all"];
      const validLocations = ["country-city", "city", "country"];
      const validBrowsers = browserOptions.map((d) => d);
      const validOs = osOptions.map((d) => d);

      const slugParam = urlParams.get('slug') || "";
      const period = validPeriods.includes(urlParams.get('period') || "") ? urlParams.get('period') as "30d" | "15d" | "5d" : "30d";
      const device = validDevices.includes(urlParams.get('device') || "") ? urlParams.get('device') as "all" | "mobile" | "desktop" : "all";
      const browsers = (urlParams.get('browsers')?.split(',') || validBrowsers).filter((b) => validBrowsers.includes(b));
      const os = (urlParams.get('os')?.split(',') || validOs).filter((os) => validOs.includes(os));
      const locationParam = urlParams.get('location');
      const location = validLocations.includes(locationParam || "") ? locationParam! : "country-city";

      const filters: GraphsFilters = {
        slug: slugParam,
        access: { last: period, type: device },
        browser: browsers.length > 0 ? browsers : validBrowsers,
        location: location as "country-city" | "city" | "country",
        os: os.length > 0 ? os : validOs,
      };

      setGraphsFilters(filters);
      setFiltersBeforeFetch(filters);
      fetchData(filters);
      setSlug(slugParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = () => {
    setGraphsFilters({ ...filtersBeforeFetch });
    updateURL({ ...filtersBeforeFetch });
    fetchData({ ...filtersBeforeFetch });
  };

  const handleFilterReset = () => {
    const resetFilters = getDefaultFilters(chartsData, slug);
    updateURL(resetFilters);
    setGraphsFilters(resetFilters);
    setFiltersBeforeFetch(resetFilters);
    fetchData(resetFilters);
  };

  const updateURL = (filters: GraphsFilters) => {
    const urlFilters = new URLSearchParams();
    urlFilters.set('slug', filters.slug);
    urlFilters.set('period', filters.access.last);
    urlFilters.set('device', filters.access.type);
    urlFilters.set('browsers', filters.browser.join(','));
    urlFilters.set('location', filters.location);
    urlFilters.set('os', filters.os.join(','));
    const newUrl = `${window.location.pathname}?${urlFilters.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  const [noData, setNoData] = useState(false);

  const fetchData = async (filters: GraphsFilters) => {
    setIsLoading(true);
    setNoData(false); // <-- Adicione isso aqui!

    const userPlan = localStorage.getItem('userPlan');

    if (!userPlan) {
      toast.error("User plan not found. Please log in again.", {
        duration: 10000,
        position: "top-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    const validateUserPlan = await fetch('/api/auth/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${localStorage.getItem('token') || ''}`,
        'userPlan': userPlan,
      },
    });
    if (!validateUserPlan.ok) {
      toast.error("Failed to validate user plan. Please try again later.", {
        duration: 10000,
        position: "top-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      return;
    }

    if (validateUserPlan.status === 401) {
      toast.error("Unauthorized access. Please log in again.", {
        duration: 10000,
        position: "top-center",
        icon: "🔒",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    const validateUserPlanData = await validateUserPlan.json();

    if (validateUserPlanData.permissions.includes('data-analysis') === false) {
      toast.error("Unauthorized access. Your plan does not allow you to access this page.", {
        duration: 10000,
        position: "top-center",
        icon: "🔒",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      return;
    }

    const response = await fetch('/api/data-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({
        slug: filters.slug,
        period: filters.access.last,
        type: filters.access.type,
        browsers: filters.browser,
        location: filters.location,
        os: filters.os,
      }),
    });
    if (!response.ok) {
      if (response.status === 404) {
        toast.error("Link not found", {
          duration: 10000,
          position: "top-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        setNoData(true);
        setIsLoading(false);
        return;
      }
      toast.error("Failed to fetch data. Please try again later.", {
        duration: 10000,
        position: "top-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      const errorData = await response.json();
      console.log("Error fetching data:", errorData);
      return;
    }

    const data = await response.json();
    setChartsData({
      accessChart: Array.isArray(data.accessChart) ? data.accessChart : [],
      browserChart: Array.isArray(data.browserChart) ? data.browserChart : [],
      locationChart: Array.isArray(data.locationChart) ? data.locationChart : [],
      osChart: Array.isArray(data.osChart) ? data.osChart : [],
    });
    setIsLoading(false);

    if (data.accessChart.length === 0) {
      setNoData(true);
      toast.error("No data found for the selected filters.", {
        duration: 5000,
        position: "top-center",
        icon: "📉",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center sm:items-start w-full">
        <div className="flex flex-col gap-2 items-center m-auto">
          <h1 className="text-4xl font-bold">analysis</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            analise the access of your links with ease
          </p>
          {slug !== "" ? (
            <small className="text-xs text-zinc-400">slug: <span className="text-lime-500">{slug}</span></small>
          ) : (
            <small className="text-xs text-zinc-400">filtering: <span className="text-lime-500">all links</span></small>
          )}
        </div>
        <div className="w-full flex flex-row gap-4 flex-wrap justify-center mx-auto">
          <div className="flex md:flex-row flex-col w-full md:justify-end justify-center gap-2 items-end">
            <div className="flex flex-col gap-1 md:w-fit w-full">
              <small className="text-xs text-zinc-400">period:</small>
              <Select
                value={filtersBeforeFetch.access.last as "30d" | "15d" | "5d"}
                onValueChange={(e: "30d" | "15d" | "5d") => setFiltersBeforeFetch({ ...filtersBeforeFetch, access: { ...filtersBeforeFetch.access, last: e } })}
              >
                <SelectTrigger className="border-zinc-500 bg-zinc-800 md:w-30 w-full">
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
            </div>
            <div className="flex flex-col gap-1 md:w-fit w-full">
              <small className="text-xs text-zinc-400">device:</small>
              <Select
                value={filtersBeforeFetch.access.type}
                onValueChange={(e: "all" | "mobile" | "desktop") => setFiltersBeforeFetch({ ...filtersBeforeFetch, access: { ...filtersBeforeFetch.access, type: e } })}
              >
                <SelectTrigger className="border-zinc-500 bg-zinc-800 md:w-30 w-full">
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
            <div className="flex flex-col gap-1 md:w-fit w-full">
              <small className="text-xs text-zinc-400">browsers:</small>
              <DropdownMenu>
                <DropdownMenuTrigger className="border-zinc-500 flex flex-row justify-between items-center p-2 rounded-lg border-1 gap-1 bg-zinc-800 md:w-30 w-full">
                  <span className="text-sm">Browsers</span>
                  <ChevronDown className="w-4 h-4 text-zinc-600 mr-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-zinc-500 bg-zinc-800 text-white">
                  <DropdownMenuLabel className="px-2">Browsers</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="focus:bg-zinc-500" onClick={() => setFiltersBeforeFetch({ ...filtersBeforeFetch, browser: browserOptions.map((d) => d) })} >all</DropdownMenuItem>
                  {browserOptions.map((d) => {
                    return <DropdownMenuCheckboxItem
                      className="focus:bg-zinc-500"
                      checked={filtersBeforeFetch.browser.includes(d)}
                      key={d}
                      onCheckedChange={() => {
                        if (filtersBeforeFetch.browser.includes(d)) {
                          // Só permite remover se houver mais de 1 selecionado
                          if (filtersBeforeFetch.browser.length > 1) {
                            setFiltersBeforeFetch({
                              ...filtersBeforeFetch,
                              browser: filtersBeforeFetch.browser.filter((b: string) => b !== d),
                            });
                          }
                        } else {
                          setFiltersBeforeFetch({
                            ...filtersBeforeFetch,
                            browser: [...filtersBeforeFetch.browser, d],
                          });
                        }
                      }}>
                      {d}
                    </DropdownMenuCheckboxItem>
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1 md:w-fit w-full">
              <small className="text-xs text-zinc-400">os:</small>
              <DropdownMenu>
                <DropdownMenuTrigger className="border-zinc-500 flex flex-row justify-between items-center p-2 rounded-lg border-1 gap-1 bg-zinc-800 md:w-30 w-full">
                  <span className="text-sm">OS</span>
                  <ChevronDown className="w-4 h-4 text-zinc-600 mr-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-zinc-500 bg-zinc-800 text-white">
                  <DropdownMenuLabel className="px-2">Operational Systems</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="focus:bg-zinc-500" onClick={() => setFiltersBeforeFetch({ ...filtersBeforeFetch, os: osOptions.map((d) => d) })} >all</DropdownMenuItem>
                  {osOptions.map((d) => {
                    return <DropdownMenuCheckboxItem
                      className="focus:bg-zinc-500"
                      checked={filtersBeforeFetch.os.includes(d)}
                      key={d}
                      onCheckedChange={() => {
                        if (filtersBeforeFetch.os.includes(d)) {
                          // Só permite remover se houver mais de 1 selecionado
                          if (filtersBeforeFetch.os.length > 1) {
                            setFiltersBeforeFetch({
                              ...filtersBeforeFetch,
                              os: filtersBeforeFetch.os.filter((b: string) => b !== d),
                            });
                          }
                        } else {
                          setFiltersBeforeFetch({
                            ...filtersBeforeFetch,
                            os: [...filtersBeforeFetch.os, d],
                          });
                        }
                      }}>
                      {d}
                    </DropdownMenuCheckboxItem>
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1 md:w-fit w-full">
              <small className="text-xs text-zinc-400">location:</small>
              <Select
                value={filtersBeforeFetch.location}
                onValueChange={(e: string) => setFiltersBeforeFetch({ ...filtersBeforeFetch, location: e })}
              >
                <SelectTrigger className="border-zinc-500 bg-zinc-800 md:w-36 w-full">
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
            <div className="flex md:flex-row flex-col gap-2 md:mt-0 mt-2 md:w-fit w-full">
              <Button onClick={handleFilterChange} className="cursor-pointer bg-lime-600 md:w-fit w-full justify-between hover:bg-lime-700 text-white px-4 py-2 rounded-lg flex items-center gap-1">
                <span className="md:hidden inline">Filter</span>
                <div className="flex flex-row">
                  <Filter className="w-4 h-4" />
                  <small className={`text-xs font-bold text-zinc-200 ${JSON.stringify(filtersBeforeFetch) === JSON.stringify(graphsFilters) ? 'hidden' : 'inline ml-1'}`}>*</small>
                </div>
              </Button>
              <Button onClick={handleFilterReset} className="cursor-pointer bg-zinc-600 md:w-fit w-full justify-between hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center gap-1">
                <span className="md:hidden inline">Reset</span>
                <RefreshCcwIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {isLoading ? <div className="w-full h-[80vh] flex items-center justify-center"><Loader className="w-6 h-6 animate-spin" /></div> : (
            noData ? (
              <div className="w-full h-[80vh] flex items-center justify-center">
                <p className="text-gray-500 text-lg">No data available for the selected filters.</p>
              </div>
            ) : (
              <>
                <AccessChart
                  type={graphsFilters.access.type as "all" | "mobile" | "desktop"}
                  period={graphsFilters.access.last as "30d" | "15d" | "5d"}
                  data={chartsData.accessChart}
                />
                <BrowserChart browsers={graphsFilters.browser} data={chartsData.browserChart} />
                <LocationChart location={graphsFilters.location} data={chartsData.locationChart} />
                <OsChart os={graphsFilters.os} data={chartsData.osChart} />
              </>
            )
          )}
        </div>
        <Toaster />
      </main>
      <FooterInfo />
    </div>
  );
}
