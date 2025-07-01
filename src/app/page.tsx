'use client';
import ShortenUrlForm from "./shortenUrlForm";
import { DollarSign, FolderArchive, Github } from "lucide-react";
import Link from "next/link";
import Header from "./header";
import FooterInfo from "@/components/FooterInfo";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-4xl font-bold">quickurl</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            quickurl is a URL shortening service that allows you to create short
            URLs for your links.
          </p>
        </div>
        <ShortenUrlForm />
      </main>
      <footer className="flex flex-col items-center justify-center fixed-bottom-0 left-0 right-0 gap-3">
        <div className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/enz0rd"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-4 h-4" />
            creator github
          </a>
          <Link
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="/pricing"
          >
            <DollarSign className="w-4 h-4" />
            pricing
          </Link>
          <a
            href="https://github.com/enz0rd/quickurl"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FolderArchive className="w-4 h-4" />
            repo
          </a>
        </div>
        <FooterInfo />
      </footer>
    </div>
  );
}
