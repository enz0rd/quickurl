'use client'
import { Logo } from "@/components/Logo";
import { Loader, Lock } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UAParser } from "ua-parser-js";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const [isCheckingUrl, setCheckingUrl] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setCheckingUrl(true);

      const userAgent = navigator.userAgent;
      const userAgentData = new UAParser(userAgent);

      const location = await fetch("https://get.geojs.io/v1/ip/geo.json")

      const locationData = await location.json();

      const dataAnalytics = {
        country: locationData.country, // Replace with actual data if available
        city: locationData.city, // Replace with actual data if available
        browser: userAgentData.getBrowser().name, // Replace with actual data if available
        os: userAgentData.getOS().name, // Replace with actual data if available
        device: userAgentData.getDevice(), // Replace with actual data if available
      }


      const slug = window.location.pathname.split("/")[2];
      const req = await fetch(`/api/redirect?slug=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: dataAnalytics ? JSON.stringify(dataAnalytics) : undefined,
      });

      if (!req.ok) {
        if (req.status == 404) {
          toast.error("Shortened link not found", {
            duration: 10000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
          return;
        }
        if (req.status == 400) {
          toast.error("Missing slug", {
            duration: 10000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
        }
        if (req.status == 403) {
          setIsLoading(false);
          const body = await req.json();
          toast.error(body.error, {
            duration: 10000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
          return;
        }

        toast.error("Something went wrong, please try again later", {
          duration: 10000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
      } else {
        const response = await req.json();
        if (response.hasPassword) {
          setHasPassword(true);
          setCheckingUrl(false);
          // window.location.href = `/p/${slug}`;
          return;
        }

        window.location.href = response.urlToRedirect;
      }
    };
    if (!isCheckingUrl) {
      fetchData();
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitPassword = async (data: FormValues) => {
    setIsLoading(true);
    setCheckingUrl(true);

    const userAgent = navigator.userAgent;
    const userAgentData = new UAParser(userAgent);

    const location = await fetch("https://get.geojs.io/v1/ip/geo.json")

    const locationData = await location.json();

    const dataAnalytics = {
      country: locationData.country, // Replace with actual data if available
      city: locationData.city, // Replace with actual data if available
      browser: userAgentData.getBrowser().name, // Replace with actual data if available
      os: userAgentData.getOS().name, // Replace with actual data if available
      device: userAgentData.getDevice(), // Replace with actual data if available
    }

    const bodyData = {
      password: data.password,
      ...dataAnalytics, // Include analytics data in the request body
    }

    const slug = window.location.pathname.split("/")[2];
    const req = await fetch(`/api/redirect/auth?slug=${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    if (!req.ok) {
      if (req.status == 401) {
        setIsLoading(false);
        toast.error("Invalid password", {
          duration: 10000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        return;
      }
      if (req.status == 404) {
        setIsLoading(false);
        toast.error("Shortened link not found", {
          duration: 10000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        return;
      }
      if (req.status == 400) {
        setIsLoading(false);
        toast.error("Missing slug", {
          duration: 10000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
      }
      if (req.status == 403) {
        setIsLoading(false);
        const body = await req.json();
        alert(body);
        toast.error(body.error, {
          duration: 10000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
        return;
      }

      setIsLoading(false);
      toast.error("Something went wrong, please try again later", {
        duration: 10000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    } else {
      const response = await req.json();

      window.location.href = response.urlToRedirect;
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <a href={'/'} className="flex flex-row gap-3 items-center ">
            <Logo size={24} />
            <h1 className="text-md font-bold my-auto">quickurl</h1>
          </a>
          <div className="flex flex-row gap-3 items-center ">
            <Loader className="h-10 w-10 animate-spin my-auto" />
            <h1 className="text-4xl font-bold my-auto">redirecting</h1>
          </div>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            please wait till we redirect you
          </p>
          <AlertDialog open={hasPassword}>
            <AlertDialogContent className="bg-zinc-900 border-zinc-500 max-w-[300px]">
              <AlertDialogTitle>This link is protected</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Please enter the password to continue
              </AlertDialogDescription>
              <form onSubmit={handleSubmit(handleSubmitPassword)} className="flex flex-col gap-1">
                <div className=" flex flex-row gap-1 items-center">
                  <Lock className="h-4 w-4 text-zinc-400 pb-1" />
                  <label htmlFor="password" className=" text-zinc-400 text-sm mb-2">
                    Password
                  </label>
                </div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...register("password")}
                />
                <Button
                  disabled={isLoading}
                  type="submit"
                  className="bg-lime-500 text-zinc-900 hover:bg-lime-500/60 cursor-pointer mt-2"
                >
                  {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : "Submit"}
                </Button>
              </form>
            </AlertDialogContent>
          </AlertDialog>
          <Toaster />
        </div>
      </main>
    </div>
  );
}
