"use client";
import FooterInfo from "@/components/FooterInfo";
import React, { useEffect, useState, Suspense } from "react";
import Header from "@/app/header";
import { Link } from "@/lib/schema";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Link2Off, Loader, Minus, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import GroupCombobox from "@/components/GroupCombobox";

const linkSchema = z.object({
  slug: z.string().min(6, {
    message: "link slug should have at least 6 characters",
  }).max(20, {
    message: "link slug should have at most 20 characters",
  }).refine(
    (value) => /^[a-zA-Z0-9-_]+$/.test(value),
    {
      message: "link slug can only contain alphanumeric characters, dashes, and underscores",
    }
  ),
  originalUrl: z.string({
    message: "original url is required",
  }),
  groupId: z.string().optional(),
  uses: z.number().min(0).optional(),
  expDate: z.string().optional(),
  password: z.string().optional(),
  resetPassword: z.boolean().optional(),
});

type LinkSchema = z.infer<typeof linkSchema>;

function EditPageContent() {
  const [fetchLink, setFetchedLink] = useState<Link>({} as Link);
  const [isFetching, setFetching] = useState(true);
  const searchParams = useSearchParams();

  const methods = useForm<LinkSchema>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      slug: "",
      originalUrl: "",
      uses: 0,
      groupId: undefined,
      expDate: undefined,
      resetPassword: false,
    },
  });

  const { handleSubmit, register, reset, setValue } = methods;

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
          throw new Error(result.error);
        }

        if (result.id) {
          setFetchedLink({
            id: result.id,
            slug: result.slug,
            originalUrl: result.originalUrl,
            group: result.group,
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
            groupId: result.group?.id || undefined,
            uses: result.uses ?? 0,
            expDate: result.expDate ? result.expDate.split("T")[0] : "",
          });
        }

      } catch (error: any) {
        if (error.message == "User does not have permission to edit links") {
          toast.error(error.message, {
            duration: 5000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
          setTimeout(() => window.location.href = '/dashboard', 2000);
        }
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
      let updateData = {};
      if (data)
        if (data.password == undefined || data.password == null || data.password == "") {
          updateData = {
            slug: data.slug,
            originalUrl: data.originalUrl,
            uses: uses,
            expDate: data.expDate
          };
        } else {
          updateData = {
            slug: data.slug,
            originalUrl: data.originalUrl,
            password: data.password,
            uses: uses,
            expDate: data.expDate,
          };
        }

      if (data.groupId) {
        updateData = {
          ...updateData,
          groupId: data.groupId
        }
      }

      let formData = {};
      if (data.resetPassword) {
        formData = {
          dataToUpdate: updateData,
          resetPassword: true,
        };
      } else {
        formData = {
          dataToUpdate: updateData,
        };
      }

      setSubmitting(true);

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
      if (!res.ok) {
        throw new Error(result.message)
      }

      toast.success(result.message, {
        duration: 5000,
        position: "bottom-center",
        icon: "🚀",
        style: { backgroundColor: "#005f08", color: "#fff" },
      });

      setTimeout(() => window.location.href = '/dashboard', 2000);
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
          <h1 className="text-4xl font-bold text-center">edit link</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap text-center">
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
                <span onClick={() => window.location.href = '/dashboard'} className="flex flex-row items-center gap-2 cursor-pointer text-zinc-300 text-md mt-2"><ArrowLeft className="h-4 w-4" /> back</span>
              </div>
            ) : (
              <Form {...methods}>
                <form
                  onSubmit={handleSubmit(onSubmit, onError)}
                  className="flex flex-col gap-2 w-[20rem] py-2"
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
                        quickurl.com.br/r/
                      </span>
                      <Input
                        className="rounded-r-lg rounded-l-none border-zinc-500 h-[2.5rem] py-2 px-2 bg-zinc-950"
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
                        className="rounded-lg border-zinc-500 h-[2.5rem] py-2 px-2 bg-zinc-950 "
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
                            htmlFor="groupId"
                            className="text-zinc-500 font-semibold text-sm pl-2"
                          >group</label>
                          <GroupCombobox
                            variant="default"
                            onForm={true}
                            selectedValue={
                              fetchLink.group
                                ? { ...fetchLink.group, shortName: fetchLink.group.shortName ?? "" }
                                : undefined
                            }
                            onSelectValue={(value) => { 
                              if (typeof value === "string") {
                                setValue("groupId", value);
                              } else if (value && typeof value === "object" && "id" in value) {
                                setValue("groupId", value.id!);
                                setFetchedLink({ ...fetchLink, group: value });
                              }
                            }}
                          />
                        </div>
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
                              className="rounded-lg border-zinc-500 h-[2.5rem] py-2 px-2 text-center bg-zinc-950"
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
                            className="border-zinc-500 text-zinc-300 rounded-lg h-[2.5rem] py-2 px-2 bg-zinc-950 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            {...register("expDate")}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label
                            htmlFor="password"
                            className="text-zinc-500 font-semibold text-sm pl-2"
                          >
                            password
                          </label>
                          <Input
                            className="rounded-lg border-zinc-500 h-[2.5rem] py-2 px-2 bg-zinc-950 "
                            id="password"
                            type="password"
                            placeholder="**********"
                            {...register("password")}
                          />
                        </div>
                        <div className="flex flex-row pl-2 items-center gap-2 cursor-pointer">
                          <Controller
                            control={methods.control}
                            name="resetPassword"
                            render={({ field }) => (
                              <Checkbox
                                className="border-1 w-4 h-4 bg-zinc-800 rounded-sm cursor-pointer data-[state=checked]:bg-red-500"
                                id="reset"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                          <label
                            htmlFor="reset"
                            className="text-zinc-500 font-semibold text-sm cursor-pointer"
                          >
                            reset password?
                          </label>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  <div className="flex flex-row justify-between items-center mt-2">
                    <span onClick={() => window.location.href = '/dashboard'} className="cursor-pointer text-md text-zinc-400">back</span>
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
