"use client";
import { Logo } from "@/components/Logo";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Menu, Star } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Header() {
  const [hasToken, setHasToken] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await validateToken(token);
      } else {
        setHasToken(false);
      }
    };
    checkToken();
  }, []);

  async function validateToken(token: string) {
    const response = await fetch(`/api/auth/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        userPlan: localStorage.getItem("userPlan") || "",
      },
    });
    if (response.ok) {
      setHasToken(true);
      const data = await response.json();
      setPermissions(data.permissions);
    } else {
      if (window.location.pathname !== "/login") {
        setTimeout(() => (window.location.href = "/login"), 2000);
      }
      setHasToken(false);
      setPermissions([]);
      localStorage.removeItem("token");
    }
  }

  return (
    <div className="flex flex-row md:my-0 my-[5rem] gap-2 items-center justify-between w-full">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-row gap-2 items-center">
        <Logo type="dark" bg={false} size={48} />
        <span className="text-zinc-200 font-bold text-2xl">quickurl</span>
        <span className="text-zinc-200 font-bold text-sm">
          <span className="text-lime-500 text-sm">beta</span>
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Sheet>
          <SheetTrigger asChild>
            <div className="block md:hidden bg-lime-800/60 hover:bg-lime-800/30 border-lime-600 border p-1 mx-3 my-1 rounded-lg">
              <Menu className="h-6 w-6 text-white" />
            </div>
          </SheetTrigger>
          <SheetContent className="bg-zinc-900 border-lime-500">
            <div
              className="bg-gradient-to-br from-lime-500/20 
        via-30% to-90% via-transparent to-lime-800/20 h-full"
            >
              <SheetTitle className="mt-10 w-full justify-center flex">
                <div className="flex flex-row gap-2 items-center">
                  <Logo type="dark" bg={false} size={48} />
                  <span className="text-zinc-200 font-bold text-2xl">
                    quickurl
                  </span>
                  <span className="text-zinc-200 font-bold text-sm">
                    <span className="text-lime-500 text-sm">beta</span>
                  </span>
                </div>
              </SheetTitle>
              <div className="flex flex-col mt-10 items-center gap-3">
                <Link href="/" className="text-white px-3 py-1 rounded-full">
                  home
                </Link>
                {hasToken ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-white px-3 py-1 rounded-full"
                    >
                      dashboard
                    </Link>
                    {permissions.includes("data-analysis") ? (
                      <Link
                        href="/data-analysis"
                        className="text-white px-3 py-1 rounded-full"
                      >
                        <span className="text-zinc-300">analysis</span>
                      </Link>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild className="md:hidden block">
                          <div className="flex items-center gap-1 text-white px-3 py-1 rounded-full">
                            <span className="text-zinc-500">analysis</span>
                            {/* <Star className="w-4 h-4 fill-zinc-500 text-zinc-500" /> */}
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-900 flex flex-col gap-1">
                          <AlertDialogTitle></AlertDialogTitle>
                          <AlertDialogDescription className="flex flex-col gap-2">
                            this is a premium feature.
                            <Link
                              href="/pricing"
                              className="text-lime-500 hover:text-lime-500/80"
                            >
                              learn more
                            </Link>
                          </AlertDialogDescription>
                          <AlertDialogFooter className="flex md:flex-row flex-col w-full">
                            <AlertDialogTrigger asChild>
                              <Button className="mt-5 w-fit hover:text-zinc-700 text-zinc-800 hover:bg-zinc-200/80 bg-zinc-100 cursor-pointer mx-auto">
                                Close
                              </Button>
                            </AlertDialogTrigger>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Link
                      href="/logout"
                      className="text-white px-3 py-1 rounded-full"
                    >
                      logout
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-white px-3 py-1 rounded-full"
                  >
                    login
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden md:flex flex-row gap-2">
          <Link
            href="/"
            className="text-white bg-lime-800/60 hover:bg-lime-800/30 border-lime-600 border px-3 py-1 rounded-full transition"
          >
            home
          </Link>
          {hasToken ? (
            <>
              <Link
                href="/dashboard"
                className="text-white bg-lime-800/60 hover:bg-lime-800/30 border-lime-600 border px-3 py-1 rounded-full transition"
              >
                dashboard
              </Link>
              {permissions.includes("data-analysis") ? (
                <a
                  href="/data-analysis"
                  className="bg-lime-800/60 hover:bg-lime-800/30 border-lime-600 border px-3 py-1 rounded-full transition"
                >
                  <span className="text-zinc-50">analysis</span>
                </a>
              ) : (
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-row items-center whitespace-nowrap gap-1 text-zinc-500 
                      bg-zinc-950 px-3 py-1 rounded-full hidden md:flex">
                        <span>analysis</span>
                        {/* <Star className="w-3 h-3 fill-zinc-500" /> */}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="bg-zinc-950 flex flex-col gap-1"
                    >
                      <p>this is a premium feature.</p>
                      <Link
                        href="/pricing"
                        className="text-lime-500 hover:text-lime-500/80"
                      >
                        learn more
                      </Link>
                    </TooltipContent>
                  </Tooltip>
                  <Link
                    href="/pricing"
                    className="text-zinc-900 bg-lime-500 font-bold flex gap-2 items-center
                    hover:bg-lime-600 border-lime-600 border px-3 py-1 rounded-full
                    transition"
                  >
                    go premium
                    <Star className="w-4 h-4 fill-zinc-900" />
                  </Link>
                </div>
              )}
              <Link
                href="/logout"
                className="text-white bg-lime-800/60 hover:bg-lime-800/30 border-lime-600 border px-3 py-1 rounded-full transition"
              >
                logout
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="text-white bg-lime-800/60 hover:bg-lime-800/30 border-lime-600 border px-3 py-1 rounded-full transition"
            >
              login
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
