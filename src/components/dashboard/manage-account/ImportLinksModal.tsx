import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { File, Loader, X } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ImportLinksModal() {
  var [isOpen, setIsOpen] = React.useState(false);
  var [isFileSelected, setIsFileSelected] = React.useState({
    fileName: "",
    selected: false,
  });
  var [fileContent, setFileContent] = React.useState("");
  var [tableContent, setTableContent] = React.useState<any[]>([]);
  var [isImporting, setIsImporting] = React.useState(false);

  const handleStepOneFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    try {
      if (!file) throw new Error("No file selected");

      if (file.type === "application/json") {
        const content = await file.text();
        setFileContent(content);

        const formattedJson = formatJsonContent(content);
        if (formattedJson !== null) {
          setTableContent(formattedJson)
        } else {
          throw new Error("Failed to parse JSON content");
        };
      } else if (file.type === "text/csv") {
        const content = await file.text();
        setFileContent(content);

        const formattedCsv = formatCsvContent(content);
        if (formattedCsv !== null) {
          setTableContent(formattedCsv)
        } else {
          throw new Error("Failed to parse CSV content");
        };
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        const buffer = await file.arrayBuffer();

        const formattedExcel = formatExcelContent(buffer);
        if (formattedExcel !== null) {
          setTableContent(formattedExcel)
        } else {
          throw new Error("Failed to parse Excel content");
        };
      } else {
        throw new Error("Unsupported file type");
      }

      setIsFileSelected({ fileName: file.name, selected: true });
    } catch (error: unknown) {
      console.error("Error reading/parsing file:", error);
      toast.error(
        `Failed to parse file. Please ensure it is properly formatted and of a supported type. Error: ${(error as Error).message}`,
        {
          duration: 5000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        },
      );
    }
  };

  const handleStepTwoImport = async () => {
    setIsImporting(true);
    try {
      const plan = localStorage.getItem("userPlan") || "";
      console.log("Importing links with plan:", plan);

      const res = await fetch("/api/links/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || "",
          UserPlan: plan,
        },
        body: JSON.stringify(tableContent),
      });

      const data = await res.json();
      if (res.status !== 200) {
        throw new Error(
          `Failed to import links: ${data.error || "Unknown error"}`,
        );
      }

      if (res.ok) {
        setIsOpen(false);
        setIsFileSelected({ fileName: "", selected: false });
        setFileContent("");
        setTableContent([]);
        toast.success("Links imported successfully!", {
          duration: 3000,
          position: "bottom-center",
          icon: "✅",
          style: { backgroundColor: "#007500", color: "#fff" },
        });
        setIsImporting(false);
        setTimeout(() => {
          window.location.href = "/dashboard/";
        }, 1500);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        (err as Error).message || "Failed to import links. Please try again.",
        {
          duration: 5000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        },
      );
      setIsImporting(false);
    }
  };

  const formatJsonContent = (jsonString: string) => {
    try {
      const jsonData = JSON.parse(jsonString);
      if (Array.isArray(jsonData)) {
        return jsonData;
      } else {
        throw new Error("JSON content must be an array of links");
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  };

  const formatCsvContent = (csvString: string) => {
    try {
      const result = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: (field) =>
          ["timesUsed", "uses"].includes(String(field)),
        transform: (value) =>
          value
            .trim()
            .replace(/^"(.*)"$/, "$1")
            .replace(/\\"/g, '"'),
      });

      return result.data;
    } catch (error) {
      console.error("Error parsing CSV:", error);
      return null;
    }
  };

  const formatExcelContent = (buffer: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<
        (string | number | boolean | null)[]
      >(worksheet, {
        header: 1,
        defval: "",
        raw: false,
      });
      const formattedRows: {
        slug: string;
        originalUrl: string;
        uses: number;
        timesUsed: number;
        expDate: string;
      }[] = rows.slice(1).map((row) => ({
        slug: String(row[0] ?? "").trim(),
        originalUrl: String(row[1] ?? "").trim(),
        uses: Number(row[2] ?? 0),
        timesUsed: Number(row[3] ?? 0),
        expDate: String(row[4] ?? "").trim(),
      }));
      console.log("Parsed Excel rows:", formattedRows);
      return formattedRows;
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      return null;
    }
  };

  return (
    <>
      <Toaster />
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button className="bg-zinc-200 hover:bg-zinc-200/60 text-zinc-900 cursor-pointer w-24">
            import
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-zinc-900 border-zinc-500 rounded-xl md:w-fit w-[400px] justify-center">
          <AlertDialogHeader className="flex flex-row justify-between items-start">
            <AlertDialogTitle>Import Links</AlertDialogTitle>
            <X
              onClick={() => {
                if (isImporting) {
                  toast.error("Cannot close while import is in progress", {
                    duration: 3000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                  });
                } else {
                  setIsOpen(false);
                  setIsFileSelected({ fileName: "", selected: false });
                }
              }}
              className="h-4 w-4 text-zinc-400 cursor-pointer"
            />
          </AlertDialogHeader>
          <AlertDialogDescription className="flex flex-col gap-1">
            <span className="text-zinc-400">
              Here you can import your links from a file.
            </span>
            <small className="text-zinc-500 text-xs">
              Supported formats: CSV, Excel and JSON
            </small>
          </AlertDialogDescription>
          {/* Step 1: File selection */}
          {!isFileSelected.selected ? (
            <div className="flex flex-col gap-3">
              <label
                htmlFor="fileToImport"
                className="w-full h-25 aspect-square self-center border border-zinc-500 rounded-xl flex p-2 items-center justify-center cursor-pointer"
              >
                <File className="text-zinc-500" size={36} />
                <div className="text-zinc-500 text-sm ml-2">
                  click here to select file
                </div>
              </label>
              <Input
                id="fileToImport"
                type="file"
                onChange={handleStepOneFileChange}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json"
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <span className="text-zinc-400 text-xs">
                File selected: {isFileSelected.fileName}
              </span>
              <div className="w-full flex flex-col">
                <div className="grid grid-cols-4 bg-lime-950/50 px-3 py-2 border border-lime-500 rounded-t-lg font-bold text-lime-500 text-sm">
                  <span className="col-span-1 mx-auto">slug</span>
                  <span className="col-span-3 mx-auto">original url</span>
                </div>
                <ScrollArea className="h-72 w-[100%] border border-zinc-500 rounded-b-lg">
                  {tableContent.map((row, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-4 px-2 py-1 gap-2 text-sm ${index === tableContent.length - 1 ? "" : "border-b"} border-zinc-500 items-center`}
                    >
                      <span className="col-span-1 mx-auto text-lime-500 font-bold text-wrap break-words overflow-x-clip text-ellipsis">
                        {row.slug || "slug will be generated"}
                      </span>
                      <span className="col-span-3 text-wrap break-words overflow-x-clip text-ellipsis">
                        {row.originalUrl || "no url found"}
                      </span>
                    </div>
                  ))}
                  <ScrollBar />
                </ScrollArea>
                <small className="text-xs text-center text-zinc-500 mt-2">
                  Preview of the links to be imported. All slugs will be
                  regenerated!
                </small>
                <span className="text-xs text-center text-red-500 mt-2">
                  Do not close this window while the import is in progress!
                </span>
              </div>
            </div>
          )}
          <Button
            disabled={!isFileSelected.selected || isImporting}
            onClick={handleStepTwoImport}
            className="bg-lime-500 text-zinc-900 hover:bg-lime-500/80 cursor-pointer w-full"
          >
            {isImporting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "import"
            )}
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
