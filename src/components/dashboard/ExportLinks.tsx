"use client";
import React from "react";
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { BadgePlus, Loader, Share, Star, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import toast, { Toaster } from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function ExportLinksButton() {
  var [open, setOpen] = React.useState(false);
  var [loading, setLoading] = React.useState(false);

  const escapeCsvValue = (value: string) => {
    if (value === null || value === undefined) return "";

    const str = String(value);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const jsonToCsv = (rows: Record<string, unknown>[]) => {
    if (!rows.length) return "";

    const headers = Object.keys(rows[0]);
    const headerRow = headers.map(escapeCsvValue).join(",");

    const dataRows = rows.map((row) => {
      return headers
        .map((header) => escapeCsvValue(row[header] as string))
        .join(",");
    });

    return [headerRow, ...dataRows].join("\n");
  };

  const handleExportLinks = async (type: "JSON" | "EXCEL" | "CSV") => {
    try {
      setLoading(true);

      const res = await fetch(`/api/links/export?type=${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || "",
          userPlan: localStorage.getItem("userPlan") || "",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage =
          errorData?.error || "Failed to export links. Please try again later.";

        toast.error(errorMessage, {
          duration: 5000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        return;
      }

      const date = new Date().toLocaleDateString("pt-BR").replace(/\//g, "_");

      switch (type) {
        case "JSON": {
          const data = await res.json();
          const jsonData = JSON.stringify(data.list, null, 2);
          const blob = new Blob([jsonData], { type: "application/json" });
          const url = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = `QuickUrl_Links_${date}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        }

        case "CSV": {
          const data = await res.json();
          const rows = data.list || data;
          const csvData = jsonToCsv(rows);

          const blob = new Blob(["\ufeff" + csvData], {
            type: "text/csv;charset=utf-8;",
          });

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `QuickUrl_Links_${date}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        }

        case "EXCEL": {
          const data = await res.json();
          const workSheet = XLSX.utils.json_to_sheet(data.list || data);
          const workBook = XLSX.utils.book_new();

          XLSX.utils.book_append_sheet(workBook, workSheet, "Links");
          XLSX.writeFile(workBook, `QuickUrl_Links_${date}.xlsx`);
          return;
        }

        default:
          toast.error("Invalid export type.");
          return;
      }
    } catch (error) {
      toast.error("Failed to export links. Please try again later.", {
        duration: 5000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Toaster />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Share
                onClick={() => setOpen(true)}
                className="cursor-pointer hover:bg-zinc-600 p-1 text-zinc-50 rounded-lg transition .5s"
              />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-zinc-950 flex flex-col gap-1"
            >
              <span className="flex gap-1 text-md font-bold items-center self-center">
                Export links{" "}
                <span className="bg-lime-500 px-1 py-.25 rounded-full text-xs text-zinc-900 flex gap-1 items-center">
                  new <BadgePlus className="text-zinc-900" size={12} />
                </span>
              </span>
            </TooltipContent>
          </Tooltip>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-zinc-900 border-zinc-500 rounded-xl md:w-fit w-[300px] justify-center">
          <AlertDialogHeader className="flex flex-col gap-2 justify-between">
            <div className="flex flex-row justify-between items-start">
              <AlertDialogTitle className="text-xl font-semibold flex gap-2 items-center">
                Export links{" "}
                <span className="bg-lime-500 px-1.5 py-.5 rounded-full text-sm text-zinc-900 flex gap-1 items-center">
                  new <BadgePlus className="text-zinc-900" size={12} />
                </span>
              </AlertDialogTitle>
              <X
                className="h-4 w-4 text-zinc-500 cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>
            <AlertDialogDescription className="text-sm text-zinc-500 text-justify">
              Export your links as a JSON, Excel or CSV file. This file can be
              imported later* to restore your links or transfer them to another
              account.
              <small className="text-xs text-zinc-600">
                {" "}
                * Import functionality is coming soon
              </small>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-lime-500 text-zinc-900 border-lime-400 hover:bg-lime-500/80 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex gap-2 items-center">
                    <span className="text-zinc-900">
                      Wait as we export your links
                    </span>
                    <Loader className="animate-spin text-zinc-900" size={16} />
                  </div>
                ) : (
                  "Export as"
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-950 border-zinc-500">
              <DropdownMenuItem
                onClick={() => handleExportLinks("JSON")}
                className="hover:bg-zinc-800/80 focus:bg-zinc-800/80 cursor-pointer"
              >
                <span className="text-zinc-300">JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportLinks("EXCEL")}
                className="hover:bg-zinc-800/80 focus:bg-zinc-800/80 cursor-pointer"
              >
                <span className="text-zinc-300">Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportLinks("CSV")}
                className="hover:bg-zinc-800/80 focus:bg-zinc-800/80 cursor-pointer"
              >
                <span className="text-zinc-300">CSV</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
