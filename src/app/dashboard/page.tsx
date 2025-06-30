"use client";
import React from "react";
import Header from "../header";
import FooterInfo from "@/components/FooterInfo";
import LinkList from "@/components/LinkList";

export default function Page() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center m-auto">
          <h1 className="text-4xl font-bold">dashboard</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            manage your links with ease
          </p>
        </div>
        <LinkList />
      </main>
      <FooterInfo />
    </div>
  );
}
