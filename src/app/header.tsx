'use client'
import { Logo } from "@/components/Logo";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Header() {
  const [hasToken, setHasToken] = useState(false);

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
      },
    });
    if (response.ok) {
      setHasToken(true);
    } else {
      setHasToken(false);
      localStorage.removeItem("token");
    }
  }

  return (
    <div className="flex md:flex-row flex-col md:mt-0 mt-10 gap-2 items-center justify-between w-full">
      <div className="flex flex-row gap-2 items-center">
        <Logo type="dark" bg={false} size={48} />
        <span className="text-zinc-200 font-bold text-2xl">quickurl</span>
        <span className="text-zinc-200 font-bold text-sm">
          <span className="text-lime-500 text-sm">beta</span>
        </span>
      </div>
      <div className="flex gap-2 justify-end">
        <Link 
          href="/"
          className="text-white bg-zinc-950 px-3 py-1 rounded-full"
        >
          home
        </Link>
        {hasToken ? (
          <>
            <Link
              href="/dashboard"
              className="text-white bg-zinc-950 px-3 py-1 rounded-full"
            >
              dashboard
            </Link>
            <Link
              href="/logout"
              className="text-white bg-zinc-950 px-3 py-1 rounded-full"
            >
              logout
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="text-white bg-zinc-950 px-3 py-1 rounded-full"
          >
            login
          </Link>
        )}
      </div>
    </div>
  );
}
