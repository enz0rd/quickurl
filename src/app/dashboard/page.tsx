"use client";
import React from "react";
import Header from "@/app/header";
import FooterInfo from "@/components/FooterInfo";
import LinkList from "@/components/dashboard/LinkList";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import GroupList from "@/components/dashboard/GroupList";

export default function Page() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <div className="flex flex-col gap-2 items-center m-auto">
          <h1 className="text-4xl font-bold">dashboard</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            manage your links with ease
          </p>
        </div>
        <div className="w-fit flex flex-col gap-6 justify-center mx-auto">
          <LinkList />
        
          <GroupList />
        </div>
      </main>
      <div className="flex flex-col gap-4 items-center justify-center">
        <Link href="/dashboard/manage-subscription" className="flex flex-row gap-2 items-center text-lime-500 hover:text-lime-500/80">
          <span className="text-sm font-semibold">manage subscription</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/dashboard/account" className="flex flex-row gap-2 items-center text-lime-500 hover:text-lime-500/80">
          <span className="text-sm font-semibold">manage account</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <FooterInfo />
    </div>
  );
}
