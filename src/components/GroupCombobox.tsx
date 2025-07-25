import { useEffect, useState, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Loader, X } from "lucide-react";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import toast from "react-hot-toast";
import { Group } from "@/lib/schema";
import React from "react";

interface GroupComboboxProps {
    onSelectValue?: (value: { id: string, name: string, shortName: string } | string) => void,
    variant: "short" | "default",
    selectedValue?: {
        id: string,
        name: string,
        shortName: string
    } | undefined,
    onForm?: boolean
}

export default function GroupCombobox({ onSelectValue, variant, selectedValue, onForm }: GroupComboboxProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<{ id: string, name: string, shortName: string } | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const token = window.localStorage.getItem("token");
        setIsLoggedIn(!!token);
        if (!isLoggedIn) return;
        if (!isFetching) {
            fetchGroups();
        }
    }, [isLoggedIn]);

    // Debounce para busca
    useEffect(() => {
        if (!isLoggedIn) return;
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        if (searchTerm === "") {
            // Se o campo está vazio, busca todos os grupos
            searchTimeout.current = setTimeout(() => {
                fetchGroups();
            }, 2000);
        } else {
            searchTimeout.current = setTimeout(() => {
                handleSearchGroups(searchTerm);
            }, 2000);
        }
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchTerm]);

    const fetchGroups = async () => {
        try {
            setIsFetching(true);
            const res = await fetch("/api/groups/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": window.localStorage.getItem("token") || "",
                }
            });
            const data = await res.json();

            if (!res.ok) {
                if(res.status === 401) {
                    window.localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    return;
                }
                toast.error("Failed to fetch groups. Please try again later.", {
                    duration: 5000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setIsLoggedIn(false);
                return;
            }
            setGroups(data.groups.list);
            console.log("Fetched groups:", data.groups.list);
            setIsFetching(false);
        } catch (error) {
            console.error("Error fetching groups:", error);
            setIsFetching(false);
            toast.error("Failed to fetch groups. Please try again later.", {
                duration: 5000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" }
            });
            return;
        }
    }

    const handleSearchGroups = async (searchTerm: string) => {
        try {
            setIsFetching(true);
            const res = await fetch(`/api/groups/list?search=${searchTerm}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": window.localStorage.getItem("token") || "",
                }
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error("Failed to fetch groups. Please try again later.", {
                    duration: 5000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                return;
            }
            setGroups(data.groups.list);
            setIsFetching(false);
        } catch (error) {
            console.error("Error fetching groups:", error);
            setIsFetching(false);
            toast.error("Failed to fetch groups. Please try again later.", {
                duration: 5000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" }
            });
            return;
        }
    }

    const handleChangeValue = (value: { id: string, name: string, shortName: string }) => {
        setValue({
            id: value.id,
            name: value.name,
            shortName: value.shortName || ""
        });
        if (!onForm) {
            setOpen(false);
            if (onSelectValue) {
                onSelectValue(value.id);
            }
        } else {
            setOpen(false);
            if (onSelectValue) {
                onSelectValue({
                    id: value.id,
                    name: value.name,
                    shortName: value.shortName || ""
                });
            }
        }
        return;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    data-state={open ? "open" : "closed"}
                    className="flex flex-row gap-2 items-center cursor-pointer hover:bg-zinc-800 hover:text-zinc-200 text-zinc-300 justify-between bg-zinc-950 border-lime-500 rounded-lg"
                >
                    {selectedValue ? (
                        <div className="flex flex-row items-center w-full gap-2">
                            {variant === "short" ? (
                                null
                            ) : (
                                <span className="text-start text-sm overflow-hidden truncate w-full">
                                    {selectedValue.name}
                                </span>
                            )}
                            {selectedValue.shortName && (
                                <code className="bg-lime-800/60 text-lime-500 border-lime-500 rounded-md border-1 px-1 py-[.5] flex items-center">
                                    {selectedValue.shortName}
                                </code>
                            )}
                        </div>
                    ) : (
                        value ? (
                            <div className="flex flex-row items-center w-full gap-2">
                                {variant === "short" ? (
                                    null
                                ) : (
                                    <span className="text-start text-sm overflow-hidden truncate w-full">
                                        {value.name}
                                    </span>
                                )}
                                {value.shortName && (
                                    <code className="bg-lime-800/60 text-lime-500 border-lime-500 rounded-md border-1 px-1 py-[.5] flex items-center">
                                        {value.shortName}
                                    </code>
                                )}
                            </div>
                        ) : variant === "short" ? "Group" : "Select Group"
                    )
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-lime-500" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-2 bg-zinc-900 rounded-lg border-zinc-500">
                <Command className="m-0 bg-zinc-900 text-zinc-200">
                    <CommandInput
                        placeholder="Search groups..."
                        className="h-9"
                        onValueChange={(value: string) => setSearchTerm(value)}
                    />
                    <CommandList className="bg-zinc-900 text-zinc-200">
                        <CommandItem key={0} onSelect={() => {
                            setValue(null)
                            if (onSelectValue) {
                                onSelectValue("");
                            }
                            setOpen(false);
                        }
                        }
                            className="hover:cursor-pointer data-[selected=true]:bg-zinc-800/60 data-[selected=true]:text-zinc-200 [&_svg:not([class*='text-'])]:text-zinc-200 flex flex-row items-center mt-2 bg-transparent justify-between">
                            <span className="text-sm">reset selection</span>
                            <X className="h-4 w-4 ml-auto text-lime-500" />
                        </CommandItem>
                        {isFetching ? (
                            <Loader className="h-4 w-4 animate-spin text-lime-500 mx-auto mt-2" />
                        ) : (groups.length === 0 ? (
                            <CommandEmpty className="flex flex-row gap-2 items-center mt-2 justify-center">
                                <X className="h-4 w-4" />
                                <span className="text-sm">No groups found</span>
                            </CommandEmpty>
                        ) : (
                            groups.map((group) => (
                                <CommandItem
                                    className="hover:cursor-pointer data-[selected=true]:bg-zinc-800/60 data-[selected=true]:text-zinc-200 [&_svg:not([class*='text-'])]:text-zinc-200 flex flex-row items-center mt-2 bg-transparent justify-between"
                                    key={group.id}
                                    onSelect={() => handleChangeValue({ ...group, shortName: group.shortName ?? "" })}
                                >
                                    <span className="text-sm overflow-hidden w-[100%]">
                                        {group.name}
                                    </span>
                                    {group.shortName && (
                                        <code className="ml-2 bg-lime-800/60 text-lime-500 border-lime-500 rounded-lg border-1 px-2 py-1 flex items-center">
                                            {group.shortName}
                                        </code>
                                    )}
                                </CommandItem>
                            ))
                        )
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>

    );
};