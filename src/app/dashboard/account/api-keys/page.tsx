"use client";
import Header from "@/app/header";
import ApiKeyField from "@/components/dashboard/manage-account/ApiKeyField";
import CreateKeyDialog from "@/components/dashboard/manage-account/keys/CreateKeyDialog";
import KeyDeletionButton from "@/components/dashboard/manage-account/keys/KeyDeletionButton";
import FooterInfo from "@/components/FooterInfo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Check, Copy, Loader, PencilIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

type KeyData = {
  id: string;
  name: string;
  key: string;
  expiresAt: Date;
};

export default function Page() {
  const [isFetched, setIsFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<KeyData[]>();

  useEffect(() => {
    if (!isFetched) {
      fetchData();
    }
  }, [isLoading]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You need to be logged in to access this page", {
          duration: 3000,
          position: "bottom-center",
          icon: "🔒",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        setTimeout(() => (window.location.href = "/login"), 2000);
        return;
      }

      const res = await fetch("/api/keys/list", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: token || "",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("You need to be logged in to access this page", {
            duration: 3000,
            position: "bottom-center",
            icon: "🔒",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
          setTimeout(() => (window.location.href = "/login"), 2000);
          return;
        }
        toast.error(
          result.error || "An error has ocurred, please try again later.",
          {
            duration: 3000,
            position: "bottom-center",
            icon: "🔒",
            style: { backgroundColor: "#790000", color: "#fff" },
          }
        );
        return;
      }

      setTableData(result.list);
      setIsFetched(true);
      setIsLoading(false);
      return;
    } catch (error) {
      console.log(error);
      toast.error("Error fetching api keys, please try again later", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      return;
    }
  };

  const [isCopied, setIsCopied] = useState<{
    index: number;
    active: boolean;
  }>({
    index: 0,
    active: false,
  });

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center w-full">
          <h1 className="text-4xl font-bold">api keys</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            manage your api keys
          </p>
        </div>
        {isLoading ? (
          <Loader className="h-6 w-6 m-auto animate-spin" />
        ) : (
          <Table className="bg-zinc-950 overflow-hidden rounded-lg w-[300px] md:w-[500px]">
            <TableCaption className="text-zinc-400">
              a list of your api keys, click to edit
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-zinc-950">
                <TableCell className="font-semibold w-[5%] hidden sm:table-cell">
                  #
                </TableCell>
                <TableCell className="font-semibold w-[65%] hidden sm:table-cell">
                  app name
                </TableCell>
                <TableCell className="font-semibold w-[300px] flex sm:hidden">
                  <span className="w-[7.5%]">#</span>
                  <span className="w-[62.5%]">app name</span>
                  <span className="w-[20%]">expires at</span>
                </TableCell>
                <TableCell className="font-semibold w-[20%] hidden sm:table-cell">
                  expires at
                </TableCell>
                <TableCell className="font-semibold w-[5%] hidden sm:table-cell"></TableCell>
                <TableCell className="font-semibold w-[5%] hidden sm:table-cell"></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-zinc-800">
              {!tableData || tableData?.length <= 0 ? (
                <TableRow key={0}>
                  <TableCell className="sm:table-cell hidden"></TableCell>
                  <TableCell className="hidden sm:table-cell">
                    no api keys found, start by creating one!
                  </TableCell>
                  <TableCell className="sm:table-cell hidden"></TableCell>
                  {/* Desktop */}
                  <TableCell className="hidden sm:table-cell"></TableCell>
                  <TableCell className="truncate sm:hidden table-cell">
                    no api keys found, start by creating one!
                  </TableCell>
                  <TableCell className="hidden sm:table-cell items-center cursor-pointer"></TableCell>
                  <TableCell className="hidden sm:table-cell items-center cursor-pointer"></TableCell>
                  {/* mobile */}
                </TableRow>
              ) : (
                tableData?.map((key, i) => (
                  <React.Fragment key={key.id}>
                    {/* desktop */}
                    <TableRow className="">
                      <TableCell className="hidden sm:table-cell">
                        {i + 1}
                      </TableCell>
                      <TableCell className="truncate hidden sm:table-cell">
                        {key.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {key.expiresAt
                          ? new Date(key.expiresAt).toISOString().split("T")[0]
                          : "n/a"}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          setIsCopied({ index: i, active: true });
                          navigator.clipboard.writeText(key.key);
                          setTimeout(
                            () => setIsCopied({ index: i, active: false }),
                            1000
                          );
                        }}
                        className="hidden sm:table-cell items-center cursor-pointer"
                      >
                        {isCopied.index === i && isCopied.active === true ? (
                          <Check className="w-4 h-4 text-zinc-300" />
                        ) : (
                          <Copy className="w-4 h-4 text-zinc-300" />
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell items-center cursor-pointer">
                        <KeyDeletionButton
                          variant="icon"
                          keyData={{ id: key.id, name: key.name, index: i + 1 }}
                        />
                      </TableCell>
                      {/* mobile */}
                      <TableCell className="sm:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="sm:hidden flex gap-3 w-full">
                            <span className="w-[5%] ">{i + 1}</span>
                            <span className="w-[57%] truncate sm:hidden text-start">
                              {key.name}
                            </span>
                            <span className="w-[20%] text-start">
                              {key.expiresAt
                                ? new Date(key.expiresAt)
                                    .toISOString()
                                    .split("T")[0]
                                : "n/a"}
                            </span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-zinc-950 border-zinc-500 border-1 rounded-lg">
                            <DropdownMenuItem
                              onClick={() =>
                                navigator.clipboard.writeText(key.key)
                              }
                              className="focus:bg-zinc-800/60 hover:bg-zinc-800/60 cursor-pointer"
                            >
                              <span className="text-white text-sm">copy</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="focus:bg-zinc-800/60 hover:bg-zinc-800/60 cursor-pointer"
                              onClick={(e) => e.preventDefault()}
                            >
                              <KeyDeletionButton
                                variant="default"
                                keyData={{
                                  id: key.id,
                                  name: key.name,
                                  index: i + 1,
                                }}
                              />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        )}
        <CreateKeyDialog />
        <Toaster />
      </main>
      <FooterInfo />
    </div>
  );
}
