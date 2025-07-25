"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Group as GroupType } from "@/lib/schema";
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  PencilIcon,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { GroupDeletionButton } from "@/components/dashboard/GroupDeletionButton";
import CreateGroupDialog from "@/components/dashboard/CreateGroupDialog";

const searchSchema = z.object({
  search: z.string().optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

type PaginationData = {
  list: GroupType[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

type Permissions = {
  edit: boolean;
  dataAnalysis: boolean;
  qrCode: boolean;
};

function getPagination(current: number, total: number) {
  const pages: (number | string)[] = [];
  if (total <= 4) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3 && current <= total) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
}

export default function GroupList() {
  const [paginationData, setPaginationData] = useState<PaginationData>({
    list: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 5,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const search = searchParams.get("search") || "";

        const response = await fetch(
          `/api/groups/list?page=${paginationData.currentPage}&limit=${paginationData.pageSize || 10
          }${search ? `&search=${search}` : ""}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("token") || "",
              userPlan: localStorage.getItem("userPlan") || "",
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch groups. Please try again later.", {
            duration: 5000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
          return;
        }

        const data = await response.json();
        setPaginationData(data.groups);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching groups:", error);
        toast.error("Failed to fetch groups. Please try again later.", {
          duration: 5000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [paginationData.pageSize, paginationData.currentPage]); // 🚨 aqui está o segredo

  const handlePageChange = async (newPage: number) => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const search = searchParams.get("search") || "";
      const newGroups = await fetch(
        `/api/groups/list?page=${newPage}&limit=${paginationData.pageSize}${search ? `&search=${search}` : ""
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") || "",
            userPlan: localStorage.getItem("userPlan") || "",
          },
        }
      );

      if (!newGroups.ok) {
        toast.error("Failed to fetch groups. Please try again later.", {
          duration: 5000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        return;
      }
      const data = await newGroups.json();

      setPaginationData(data.groups);
    } catch (error) {
      console.error("Error changing page:", error);
    }
  };

  const { register, handleSubmit } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  });

  const handleSearchGroups = async (search: SearchForm) => {
    try {
      setLoading(true);
      // add search param to url
      if (search.search === "") {
        window.history.replaceState(null, "QuickURL", "/dashboard");
        search.search = "";
      } else {
        window.history.replaceState(
          null,
          "QuickURL",
          "/dashboard?group_search=" + search.search
        );
      }

      const newGroups = await fetch(`/api/groups/list?search=${search.search}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || "",
          userPlan: localStorage.getItem("userPlan") || "",
        },
      });

      if (!newGroups.ok) {
        toast.error("Failed to search groups. Please try again later.", {
          duration: 5000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        return;
      }
      const data = await newGroups.json();
      setPaginationData({
        ...paginationData,
        list: data.groups.list,
        totalCount: data.groups.totalCount,
        totalPages: data.groups.totalPages,
        currentPage: 1, // Reset to first page on search
      });
      setLoading(false);
    } catch (error) {
      console.error("Error searching groups:", error);
      toast.error("Failed to search groups. Please try again later.", {
        duration: 5000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });

      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-3">
        <form
          onSubmit={handleSubmit(handleSearchGroups)}
          className="flex flex-row gap-4 max-w-[300px] mx-auto"
        >
          <Input
            type="text"
            placeholder="Search groups..."
            {...register("search")}
            className="bg-zinc-950 text-zinc-300"
            disabled={loading}
          />
          <Button
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
      <Table className="bg-zinc-950 overflow-hidden rounded-lg w-full">
        <TableCaption className="text-zinc-400">
          <CreateGroupDialog />
        </TableCaption>
        <TableHeader className="bg-zinc-800/80">
          <TableRow>
            <TableHead className="text-zinc-300 w-0 sm:w-[15%] hidden sm:table-cell">short</TableHead>
            <TableHead className="text-zinc-300 w-[90%] sm:w-[75%] text-center sm:text-left sm:table-cell">
              group
            </TableHead>
            <TableHead className="text-zinc-300 w-0 sm:w-[5%] hidden sm:table-cell" />
            <TableHead className="text-zinc-300 w-0 sm:w-[5%] hidden sm:table-cell" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-zinc-400">
                <Loader className="h-6 w-6 m-4 mx-auto animate-spin" />
              </TableCell>
            </TableRow>
          )}
          {!loading && paginationData.list.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-zinc-400">
                No groups found. Start by creating one URL!
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            paginationData.list.map((group, index) => (
              <TableRow key={index}>
                {/* Mobile 
                 */}
                <TableCell className=" text-zinc-300 max-w-[300px] md:max-w-[600px] sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      className="cursor-pointer flex items-center justify-center"
                    >
                      <div className="grid grid-cols-1 gap-1 text-center">
                        <span className="row-start-1 col-span-1 truncate overflow-hidden text-sm font-semibold text-zinc-200">
                          {group.name} <code className="text-lime-400 text-xs border-1 border-lime-400 bg-lime-800/80 rounded-lg text-center py-[.5] px-2">{group.shortName}</code>
                        </span>
                        <span className="row-start-2 truncate overflow-hidden text-xs text-zinc-400">
                          {group.description || "No description"}
                        </span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-950">
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = `/groups/edit?id=${group.id}`)
                        }
                        className="focus:bg-zinc-800/60 hover:bg-zinc-800/60"
                      >
                        <span className="text-zinc-300">edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => e.preventDefault()}
                        className="focus:bg-zinc-800/60 hover:bg-zinc-800/60"
                      >
                        <GroupDeletionButton id={group.id} name={group.name} variant="text" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                {/* Desktop */}
                <TableCell className="text-zinc-300 truncate max-w-[160px] sm:max-w-[200px] whitespace-nowrap hidden sm:table-cell">
                  <div className="grid grid-cols-1 gap-1">
                    <code className="text-lime-400 text-xs border-1 border-lime-400 bg-lime-800/80 rounded-lg text-center py-[.5]">
                      {group.shortName}
                    </code>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-300 truncate max-w-[160px] sm:max-w-[200px] whitespace-nowrap hidden sm:table-cell">
                  <div className="grid grid-cols-1 gap-1">
                    <span className="row-start-1 col-span-1 truncate overflow-hidden text-sm font-semibold text-zinc-200">
                      {group.name}
                    </span>
                    <span className="row-start-2 truncate overflow-hidden text-xs text-zinc-400">
                      {group.description || "No description"}
                    </span>
                  </div>
                </TableCell>
                {/* Edit button */}
                <TableCell className="hidden sm:table-cell text-zinc-300">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      className="cursor-pointer flex items-center"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-950">
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = `/groups/edit?id=${group.id}`)
                        }
                        className="focus:bg-zinc-800/60 hover:bg-zinc-800/60"
                      >
                        <span className="text-zinc-300">edit</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                {/* Delete */}
                <TableCell className="hidden sm:table-cell text-zinc-300">
                  <GroupDeletionButton id={group.id} name={group.name} variant="icon" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {paginationData.totalCount === 0 ? null : (
        <div className="flex items-center justify-center mt-3">
          <div
            onClick={() => {
              if (paginationData.currentPage <= paginationData.totalPages) {
                if (paginationData.currentPage == 1) {
                  return; // Se já estiver na última página, não faz nada
                  // handlePageChange(paginationData.totalPages)
                } else {
                  handlePageChange(paginationData.currentPage - 1);
                }
              } else {
                handlePageChange(paginationData.totalPages);
              }
            }}
            className={`aspect-square p-1 bg-zinc-800/60 rounded-full mx-1 cursor-pointer`}
          >
            <ChevronLeft className="w-4 h-4" />
          </div>
          {getPagination(
            paginationData.currentPage,
            paginationData.totalPages
          ).map((page, i) =>
            typeof page === "number" ? (
              <div
                key={page}
                onClick={() => {
                  if (paginationData.currentPage !== page) {
                    handlePageChange(page);
                  }
                }}
                className={`px-3 py-1 bg-zinc-800/60 rounded-full mx-1 cursor-pointer ${paginationData.currentPage === page
                  ? "border border-lime-500"
                  : ""
                  }`}
              >
                {page}
              </div>
            ) : (
              <div
                key={`ellipsis-${i}`}
                className="px-3 py-1 text-zinc-400 select-none"
              >
                ...
              </div>
            )
          )}
          <div
            onClick={() => {
              if (paginationData.currentPage <= paginationData.totalPages) {
                if (paginationData.currentPage == paginationData.totalPages) {
                  return; // Se já estiver na última página, não faz nada
                  // handlePageChange(paginationData.totalPages)
                } else {
                  handlePageChange(paginationData.currentPage + 1);
                }
              } else {
                handlePageChange(paginationData.totalPages);
              }
            }}
            className={`aspect-square p-1 bg-zinc-800/60 rounded-full mx-1 cursor-pointer ${paginationData.currentPage === paginationData.totalPages
              ? "opacity-50 cursor-not-allowed"
              : ""
              }`}
          >
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
