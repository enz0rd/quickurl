import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Newspaper, X } from "lucide-react";
import MarkdownPreview from '@uiw/react-markdown-preview';
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function UpdatesAndNews() {
    const [isChecked, setIsChecked] = useState(false);
    const [source, setSource] = useState("");
    const [updateDate, setUpdateDate] = useState(new Date('2025-07-12'));
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const lastChecked = JSON.parse(localStorage.getItem("updates") || "{}");
        alert(JSON.stringify(lastChecked.date))
        if(!lastChecked.date || new Date(lastChecked.date) < updateDate) {
            fetchData();
            setIsOpen(true);
            localStorage.setItem("updates", JSON.stringify({ date: updateDate }));
            setIsChecked(true);
        }
    }, [updateDate]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await fetch("https://raw.githubusercontent.com/enz0rd/quickurl/refs/heads/master/changelog.md", {
                method: "GET",
            });
            if(!data.ok) throw new Error("Failed to fetch data");
            const text = await data.text();
            setSource(text);
        } catch (error) {
            toast.error("An error occurred while trying to get updates. Please try again later.", {
                duration: 5000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            })
        }
    }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
            <span className="flex flex-row gap-3 hover:text-zinc-200 cursor-pointer items-center text-white">
                <Newspaper className="w-4 h-4" />
                updates and news
            </span>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-zinc-900 border-zinc-500 text-white">
            <AlertDialogHeader className="flex flex-row justify-between">
                <div className="flex flex-col gap-2">
                    <AlertDialogTitle className="self-start">Updates and News</AlertDialogTitle>
                    <AlertDialogDescription>
                        Check out the latest update we made:
                    </AlertDialogDescription>
                </div>
                <X
                    onClick={() => setIsOpen(false)}
                    className="cursor-pointer"
                />
            </AlertDialogHeader>
            <ScrollArea className="h-96 w-full flex flex-col gap-2 rounded-lg border-1 border-zinc-500">
                <MarkdownPreview 
                    source={source}
                    style={{ padding: "1rem", zoom: 0.75 }}
                />
            </ScrollArea>
            <AlertDialogFooter>
                <AlertDialogCancel className="w-full hover:text-zinc-200 text-zinc-900 bg-lime-500 hover:bg-lime-500/60 border-none cursor-pointer">Close</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
};