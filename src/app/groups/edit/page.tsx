"use client";
import FooterInfo from "@/components/FooterInfo";
import React, { useEffect, useState, Suspense } from "react";
import Header from "@/app/header";
import { Group, Link } from "@/lib/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, CircleMinus, Link2Off, Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const GroupSchema = z.object({
  name: z.string().min(6, {
    message: "group name should have at least 6 characters",
  }).max(30, {
    message: "group name should have at most 20 characters",
  }),
  shortName: z.string({
    message: "short name is required",
  }).max(4, {
    message: "short name should have at most 4 characters",
  }),
  description: z.string().max(100, {
    message: "description should have at most 100 characters",
  }).optional(),
});

type GroupValues = z.infer<typeof GroupSchema>;

function EditPageContent() {
  const [fetchGroup, setFetchedGroup] = useState<Group>({} as Group);
  const [groupLinks, setGroupLinks] = useState<Link[]>([]);
  const [isFetching, setFetching] = useState(true);
  const searchParams = useSearchParams();

  const methods = useForm<GroupValues>({
    resolver: zodResolver(GroupSchema),
    defaultValues: {
      name: "",
      shortName: "",
      description: "",
    },
  });

  const { handleSubmit, register, reset, setValue } = methods;

  // fetching link data
  useEffect(() => {
    async function fetchGroupData() {
      setFetching(true);
      try {
        const token = localStorage.getItem("token");
        const plan = localStorage.getItem("userPlan");
        const res = await fetch(
          `/api/groups/update?id=${searchParams.get("id")}`,
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

        if (result.group && result.group.id) {
          setFetchedGroup({
            id: result.group.id,
            name: result.group.name,
            description: result.group.description,
            shortName: result.group.shortName,
            ownerId: result.group.ownerId,
            createdAt: result.group.createdAt,
            updatedAt: result.group.updatedAt,
          });

          setGroupLinks(result.links);

          setUses(result.uses);

          reset({
            name: result.group.name || "",
            description: result.group.description || "",
            shortName: result.group?.shortName,
          });
        }

      } catch (error: any) {
        if (error.message == "User does not have permission to edit groups") {
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
    fetchGroupData();
  }, [searchParams]);

  const onError = (errors: any) => {
    if (errors.name) {
      toast.error(
        errors.name.message || "Please check the name entered",
        {
          duration: 3000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        }
      );
    } else if (errors.description) {
      toast.error(errors.description.message || "Please check the description entered", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    } else if (errors.shortName) {
      toast.error(errors.shortName.message || "Please check the short name entered", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    }
  };

  const [submitted, setSubmitting] = useState(false);

  const onSubmit = async (data: GroupValues) => {
    try {
      let updateData = {};

      if (data) {
        updateData = {
          name: data.name,
          description: data.description,
          shortName: data.shortName
        };
      }
      setSubmitting(true);

      const res = await fetch(`/api/groups/update?id=${searchParams.get("id")}`, {
        method: "PATCH",
        headers: {
          'Content-type': 'application/json',
          'Authorization': localStorage.getItem('token') || "",
          'userPlan': localStorage.getItem('userPlan') || ""
        },
        body: JSON.stringify(updateData)
      })

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "An error occurred, please try again later", {
          duration: 5000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        })
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

  const handleRemoveLinkFromGroup = async (linkId: string) => {
    try {
      const res = await fetch(`/api/groups/remove-link?id=${searchParams.get("id")}&linkId=${linkId}`, {
        method: "PATCH",
        headers: {
          'Content-type': 'application/json',
          'Authorization': localStorage.getItem('token') || "",
          'userPlan': localStorage.getItem('userPlan') || ""
        },
      })

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "An error occurred, please try again later", {
          duration: 5000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        })
        return;
      }

      toast.success(result.message || "Link removed successfully", {
        duration: 5000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#005f08", color: "#fff" },
      });

      setGroupLinks(groupLinks.filter(link => link.id !== linkId));
    } catch (error: any) {
      toast.error(error.error || "An error occurred, please try again later", {
        duration: 5000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    }
  }

  const [uses, setUses] = useState(0);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-4xl font-bold text-center">edit group</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap text-center">
            editing group {fetchGroup.shortName && (<code className="text-lime-400 text-xs border-1 border-lime-400 bg-lime-800/80 rounded-lg text-center py-[.5] px-2">{fetchGroup.shortName}</code>)}
          </p>
          {isFetching ? (
            <Loader className="h-6 w-6 animate-spin m-auto" />
          ) : (
            !isFetching && Object.keys(fetchGroup).length === 0 ? (
              <div className="flex flex-col justify-center mt-5 items-center">
                <Link2Off className="h-12 w-12 text-zinc-200" />
                <span className="font-bold text-zinc-300 text-xl">couldn't load group</span>
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
                      htmlFor="name"
                      className="text-zinc-500 font-semibold text-sm pl-2"
                    >
                      group name
                    </label>
                    <div className="flex flex-row items-center">
                      <Input
                        className="border-zinc-500 h-[2.5rem] py-2 px-2 bg-zinc-950"
                        id="name"
                        placeholder="Group Name"
                        {...register("name")}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="shortName"
                      className="text-zinc-500 font-semibold text-sm pl-2"
                    >
                      short name
                    </label>
                    <div className="flex flex-row items-center">
                      <Input
                        className="rounded-lg border-zinc-500 h-[2.5rem] py-2 px-2 bg-zinc-950 "
                        id="shortName"
                        placeholder="xxxxxx"
                        {...register("shortName")}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="description"
                      className="text-zinc-500 font-semibold text-sm pl-2"
                    >
                      description
                    </label>
                    <div className="flex flex-row items-center">
                      <Textarea
                        className="rounded-lg resize-y min-h-24 max-h-96 border-zinc-500 py-2 px-2 bg-zinc-950 "
                        id="description"
                        maxLength={100}
                        placeholder="A well written description"
                        {...register("description")}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">

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

          <Table className="bg-zinc-950 overflow-hidden rounded-lg w-full">
            <TableCaption className="text-zinc-400">
              shortened links in this group
            </TableCaption>
            <TableHeader className="bg-zinc-800/80">
              <TableRow>
                <TableHead className="text-zinc-300 w-[40%] sm:w-[25%] text-center sm:text-left sm:table-cell">
                  slug
                </TableHead>
                <TableHead className="text-zinc-300 w-[60%] sm:w-[60%] hidden sm:table-cell">
                  group
                </TableHead>
                <TableHead className="text-zinc-300 w-[60%] sm:w-[60%] hidden sm:table-cell">
                  original url
                </TableHead>
                <TableHead className="text-zinc-300 w-0 sm:w-[7.5%] hidden sm:table-cell" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupLinks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-400">
                    No links found. Start by shortening a URL!
                  </TableCell>
                </TableRow>
              )}
              {groupLinks.map((link, index) => (
                <TableRow key={index}>
                  {/* Mobile: slug + url juntos */}
                  <TableCell className=" text-zinc-300 max-w-[300px] md:max-w-[600px] sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        className="cursor-pointer flex items-center justify-center"
                      >
                        <span className="flex flex-row gap-2">
                          <span className="truncate max-w-[40%] overflow-hidden">
                            {link.slug}
                          </span>
                          {fetchGroup.shortName && (
                            <>
                              <span className="truncate max-w-[20%] overflow-hidden" title={fetchGroup.shortName}>
                                <code className="text-lime-400 text-xs border-1 border-lime-400 bg-lime-800/80 rounded-lg text-center py-[.5] px-2">{fetchGroup.shortName}</code>
                              </span>
                              <span className="text-zinc-500"> | </span>
                            </>
                          )}
                          <span className="truncate max-w-[40%] overflow-hidden">
                            {link.originalUrl.split("https://")[1]}
                          </span>
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-950">
                        <DropdownMenuItem
                          className="focus:bg-zinc-800/60 hover:bg-zinc-800/60"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              window.location.origin + "/r/" + link.slug
                            )
                          }
                        >
                          <span className="text-zinc-300">copy</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveLinkFromGroup(link.id)}
                          className="focus:bg-zinc-800/60 hover:bg-zinc-800/60"
                        >
                          <span className="text-zinc-300 my-auto">remove from group</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  {/* Desktop */}
                  <TableCell className="text-zinc-300 truncate max-w-[160px] sm:max-w-[200px] whitespace-nowrap hidden sm:table-cell">
                    {link.slug}
                  </TableCell>
                  <TableCell className="text-zinc-300 truncate max-w-[160px] sm:max-w-[200px] whitespace-nowrap hidden sm:table-cell" title={fetchGroup.name}>
                    {fetchGroup.shortName && (
                      <code className="text-lime-400 text-xs border-1 border-lime-400 bg-lime-800/80 rounded-lg text-center py-[.5] px-2">{fetchGroup.shortName}</code>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-300 truncate max-w-[200px] sm:max-w-[300px] whitespace-nowrap hidden sm:table-cell">
                    {link.originalUrl}
                  </TableCell>
                  {/* Edit button */}
                  <TableCell className="hidden sm:table-cell text-zinc-300">
                    <span title="remove link from group" className="cursor-pointer" onClick={() => handleRemoveLinkFromGroup(link.id)}>
                      <CircleMinus className="w-5 h-5 text-zinc-300" />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
