"use client";
import React, { useState } from "react";
import Header from "@/app/header";
import FooterInfo from "@/components/FooterInfo";
import LinkList from "@/components/dashboard/LinkList";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import GroupList from "@/components/dashboard/GroupList";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <div className="flex flex-col gap-2 items-center m-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold"
          >
            dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 text-md mx-2 text-wrap"
          >
            manage your links with ease
          </motion.p>
        </div>
        <div className="w-fit flex flex-col gap-6 justify-center mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <LinkList />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <GroupList />
          </motion.div>
        </div>
      </main>
      <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="flex flex-col gap-4 items-center justify-center">
        <Link href="/dashboard/manage-subscription" className="flex flex-row gap-2 items-center text-lime-500 hover:text-lime-500/80">
          <span className="text-sm font-semibold">manage subscription</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/dashboard/account" className="flex flex-row gap-2 items-center text-lime-500 hover:text-lime-500/80">
          <span className="text-sm font-semibold">manage account</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
      <FooterInfo />
    </div>
  );
}
