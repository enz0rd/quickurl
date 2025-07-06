"use client";
import React from "react";
import Header from "../header";
import FooterInfo from "@/components/FooterInfo";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AccessChart } from "@/components/data-analysis/AccessChart";
import { BrowserChart } from "@/components/data-analysis/BrowserChart";
import LocationChart from "@/components/data-analysis/LocationChart";

export default function Page() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center sm:items-start w-full">
        <div className="flex flex-col gap-2 items-center m-auto">
          <h1 className="text-4xl font-bold">analysis</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            analysis the access of your links with ease
          </p>
        </div>
        <div className="w-full flex flex-row gap-4 flex-wrap justify-center mx-auto">
            <AccessChart />
            <BrowserChart />
            <LocationChart />
        </div>
      </main>
      <FooterInfo />
    </div>
  );
}
