"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import Header from "@/app/header";
import FooterInfo from "@/components/FooterInfo";
import { PlanCard } from "@/components/pricing/PlanCard";
import { motion } from "framer-motion";
import LiquidEther from "@/components/LiquidEther";

export default function Page() {
  return (
    <>
      <div className="fixed inset-0 -z-10 min-h-screen w-screen">
        <LiquidEther
          mouseForce={20}
          cursorSize={100}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          colors={["#243c00", "#4b7c01", "#86d512"]}
        />
      </div>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <Header />
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="flex flex-col gap-2 items-center w-full">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold"
            >
              pricing
            </motion.h1>
            <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="text-gray-500 text-md mx-2 text-wrap">
              keep and manage your links with ease
            </motion.p>
          </div>
          <PlanCard />
          <footer className="row-start-3 flex flex-col gap-[24px] m-auto flex-wrap items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex w-full justify-center"
            >
              <Link href="/" className="flex flex-row gap-2 items-center">
                <ArrowLeft className="w-4 h-4" />
                <p>back to home</p>
              </Link>
            </motion.div>
            <FooterInfo />
          </footer>
        </main>
      </div>
    </>
  );
}
