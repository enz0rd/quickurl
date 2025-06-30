'use client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import Header from '../header';
import FooterInfo from '@/components/FooterInfo';

export default function Page() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-4xl font-bold">pricing</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            keep and manage your links with ease
          </p>
          <small>This page is under development, thanks for checking out!</small>
        </div>
        <footer className="row-start-3 flex flex-col gap-[24px] m-auto flex-wrap items-center justify-center">
            <Link href="/" className="flex flex-row gap-2 items-center">
                <ArrowLeft className="w-4 h-4" />
                <p>back to home</p>
            </Link>
            <FooterInfo />
        </footer>
      </main>
    </div>
  );
}
