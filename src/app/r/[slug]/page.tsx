'use client'
import { Logo } from "@/components/Logo";
import { Loader } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Page() {
    const [isCheckingUrl, setCheckingUrl] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setCheckingUrl(true);
            const slug = window.location.pathname.split("/")[2];
            const req = await fetch(`/api/redirect?slug=${encodeURIComponent(slug)}`);

            if(!req.ok) {
                if(req.status == 404) {
                    toast.error("Shortened link not found", {
                        duration: 10000,
                        position: "top-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                      });
                      return;
                }
                if(req.status == 400) {
                    toast.error("Missing slug", {
                        duration: 10000,
                        position: "top-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                      });
                }
                if(req.status == 403) {
                    toast.error("Link has reached its usage limit", {
                        duration: 10000,
                        position: "top-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                      });
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 3000);
                }
                
                toast.error("Something went wrong, please try again later", {
                    duration: 10000,
                    position: "top-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                  });
            } else {
                const response = await req.json();
                window.location.href = response.urlToRedirect;
            }
        };
        if(!isCheckingUrl) {
            fetchData();
        }
    }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <a href={'/'} className="flex flex-row gap-3 items-center "> 
            <Logo size={24} type="dark" bg={false} />
            <h1 className="text-md font-bold my-auto">quickurl</h1>
          </a>
          <div className="flex flex-row gap-3 items-center ">
            <Loader className="h-10 w-10 animate-spin my-auto" />
            <h1 className="text-4xl font-bold my-auto">redirecting</h1>
          </div>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            please wait till we redirect you
          </p>
          <Toaster />
        </div>
      </main>
    </div>
  );
}
