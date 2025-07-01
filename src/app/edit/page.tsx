"use client";
import FooterInfo from "@/components/FooterInfo";
import React, { useEffect, useState, Suspense } from "react";
import Header from "../header";
import { Link } from "@/lib/schema";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Link2Off, Loader, Minus, Plus, PlusCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { Button } from "@/components/ui/button";

const linkSchema = z.object({
  slug: z.string().min(6, {
    message: "link slug should have at least 6 characters",
  }),
  originalUrl: z.string(),
  uses: z.number().min(0).optional(),
  expDate: z.string().optional(),
});

type LinkSchema = z.infer<typeof linkSchema>;

function EditPageContent() {
  const [fetchLink, setFetchedLink] = useState<Link>({} as Link);
  const [isFetching, setFetching] = useState(false);
  const searchParams = useSearchParams();

  const methods = useForm<LinkSchema>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      slug: "",
      originalUrl: "",
      uses: 0,
      expDate: undefined,
    },
  });

  const { control, handleSubmit, register, reset } = methods;
  const origin = window.location.origin

  // fetching link data
  useEffect(() => {
    async function fetchLinkData() {
      setFetching(true);
      try {
        const token = localStorage.getItem("token");
        const plan = localStorage.getItem("userPlan");
        const res = await fetch(
          `/api/links/update?slug=${searchParams.get("slug")}`,
          {
            method: "GET",
            headers: {
              "Content-type": "application/json",
              Authorization: token || "",
              UserPlan: plan || "",
            },
          }
        );

        const result = await res.json();
        if (!res.ok) {
          throw new Error("Failed to fetch link data");
        }

        if (result.id) {
          setFetchedLink({
            id: result.id,
            slug: result.slug,
            originalUrl: result.originalUrl,
            userId: result.userId,
            uses: result.uses,
            expDate: result.expDate,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
          });
        
          setUses(result.uses);
          
          reset({
            slug: result.slug || "",
            originalUrl: result.originalUrl || "",
            uses: result.uses ?? 0,
            expDate: result.expDate ? result.expDate.split("T")[0] : "", // <- aqui
          });          
        }
        
      } catch (error: any) {
        toast.error(
          error.message || "An error occurred, please try again later",
          {
            duration: 5000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          }
        );
      } finally {
        setFetching(false);
      }
    }
    fetchLinkData();
  }, [searchParams]);

  const onError = (errors: any) => {
    if (errors.originalUrl) {
      toast.error(
        errors.originalUrl.message || "Please check original URL entered",
        {
          duration: 3000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        }
      );
    } else {
      toast.error(errors.slug.message || "Please check the slug entered", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    }
  };

  const [submitted, setSubmitting] = useState(false);

  const onSubmit = async (data: LinkSchema) => {
    try {
      setSubmitting(true);
      const formData = {
        ...data,
        uses: uses,
      };

      const res = await fetch(`/api/links/update?slug=${searchParams.get("slug")}`, {
        method: "PATCH",
        headers: {
          'Content-type': 'application/json',
          'Authorization': localStorage.getItem('token') || "",
          'userPlan': localStorage.getItem('userPlan') || ""
        },
        body: JSON.stringify(formData)
      })

      const result = await res.json();
      if(!res.ok) {
        throw new Error(result.message)
      }

      toast.success(result.message, {
        duration: 5000,
        position: "bottom-center",
        icon: "🚀",
        style: { backgroundColor: "#005f08", color: "#fff" },
      });

      setTimeout(() => history.back(), 2000);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "An error occurred, please try again later", {
        duration: 5000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setSubmitting(false);
    }
  };

  const [uses, setUses] = useState(0);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-4xl font-bold">edit link</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            editing link with slug <b>{searchParams.get("slug")}</b>
          </p>
          {isFetching ? (
            <Loader className="h-6 w-6 animate-spin m-auto" />
          ) : (
            !isFetching && Object.keys(fetchLink).length === 0 ? (
              <div className="flex flex-col justify-center mt-5 items-center">
                <Link2Off className="h-12 w-12 text-zinc-200" />
                <span className="font-bold text-zinc-300 text-xl">couldn't load link</span>
                <span className="text-zinc-500 text-md">please try again later</span>
                <span onClick={() => history.back()} className="flex flex-row items-center gap-2 cursor-pointer text-zinc-300 text-md mt-2"><ArrowLeft className="h-4 w-4" /> back</span>
              </div>
            ) : (
              <Form {...methods}>
                <form
                  onSubmit={handleSubmit(onSubmit, onError)}
                  className="flex flex-col gap-2 w-[18rem] py-2"
                >
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="slug"
                      className="text-zinc-500 font-semibold text-sm pl-2"
                    >
                      change slug
                    </label>
                    <div className="flex flex-row items-center">
                      <span className="bg-zinc-800 rounded-l-lg border-zinc-500 border-1 px-2 py-2 h-[2.5rem] text-zinc-400">
                        {origin}
                      </span>
                      <Input
                        className="rounded-r-lg rounded-l-none border-zinc-500 h-[2.5rem] py-2 px-2"
                        id="slug"
                        placeholder="xxxxxx"
                        {...register("slug")}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="originalUrl"
                      className="text-zinc-500 font-semibold text-sm pl-2"
                    >
                      original url
                    </label>
                    <div className="flex flex-row items-center">
                      <Input
                        className="rounded-lg border-zinc-500 h-[2.5rem] py-2 px-2 "
                        id="originalUrl"
                        placeholder="xxxxxx"
                        {...register("originalUrl")}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <div className="flex flex-row gap-2 cursor-pointer justify-center items-center align-middle">
                          <Plus className="h-3 w-3 text-zinc-400 my-auto" />
                          <span className="text-zinc-400">options</span>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <label
                            htmlFor="uses"
                            className="text-zinc-500 font-semibold text-sm pl-2"
                          >
                            uses
                          </label>
                          <div className="flex flex-row items-center justify-between gap-2">
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => setUses(Math.max(0, uses - 1))}
                              className="h-[2.5rem] w-[2.5rem] p-0 bg-transparent border-none cursor-pointer hover:"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              className="rounded-lg border-zinc-500 h-[2.5rem] py-2 px-2 text-center"
                              id="uses"
                              type="number"
                              min={0}
                              value={uses}
                              onChange={(e) =>
                                setUses(parseInt(e.target.value) || 0)
                              }
                              placeholder="0"
                            />
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => setUses(uses + 1)}
                              className="h-[2.5rem] w-[2.5rem] p-0 bg-transparent border-none cursor-pointer hover:"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <small className="text-xs text-zinc-500 mx-auto">use 0 for unlimited uses</small>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label
                            htmlFor="expDate"
                            className="text-zinc-500 font-semibold text-sm pl-2"
                          >
                            expiration date
                          </label>
                          <Input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            id="expDate"
                            className="border-zinc-500 text-zinc-300 bg-transparent rounded-lg h-[2.5rem] py-2 px-2 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            {...register("expDate")}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  <div className="flex flex-row justify-between items-center mt-2">
                      <span onClick={() => history.back()} className="cursor-pointer text-md text-zinc-400">back</span>
                      <Button 
                        type="submit" 
                        className="bg-zinc-200 py-2 px-3 hover:bg-zinc-400 text-zinc-900 cursor-pointer"
                        disabled={submitted}
                        >
                        {submitted ? (
                          <Loader className="w-4 h-4 animate-spin text-zinc-900" />
                        ) : (
                          "submit"
                        )}
                        </Button>
                  </div>
                </form>
              </Form>
            ) 
          )}

          <Toaster />
        </div>
      </main>
      <footer className="flex flex-col items-center justify-center fixed-bottom-0 left-0 right-0 gap-3">
        <FooterInfo />
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <Header />
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="flex flex-col gap-2 items-center">
            <Loader className="h-6 w-6 animate-spin m-auto" />
          </div>
        </main>
        <footer className="flex flex-col items-center justify-center fixed-bottom-0 left-0 right-0 gap-3">
          <FooterInfo />
        </footer>
      </div>
    }>
      <EditPageContent />
    </Suspense>
  );
}
