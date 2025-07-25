'use client';
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

export default function ApiLink({ path, protocol, children }: { path: string; protocol: "GET" | "POST" | "PATCH" | "DELETE", children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    
    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
                <div className={`flex justify-between px-3 py-2 rounded-lg bg-zinc-950/60 items-center cursor-pointer w-[300px] md:w-[400px] lg:w-[800px] ${open ? "rounded-b-none" : ""}`}>
                    <span className="text-sm font-semibold">{path}</span>
                    {protocol === "GET" ?
                            <code className="px-2 py-1 border-2 border-green-600 rounded-lg bg-green-700/60">GET</code>
                        : protocol === "POST" ?
                            <code className="px-2 py-1 border-2 border-yellow-600 rounded-lg bg-yellow-700/60">POST</code>
                        : protocol === "PATCH" ?
                            <code className="px-2 py-1 border-2 border-cyan-600 rounded-lg bg-cyan-700/60">PATCH</code>
                        : protocol === "DELETE" ?
                            <code className="px-2 py-1 border-2 border-red-600 rounded-lg bg-red-700/60">DELETE</code>
                        :
                            <code className="px-2 py-1 border-2 border-zinc-600 rounded-lg bg-zinc-700/60">UNKNOWN</code>
                    }
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-zinc-800/60 flex flex-col transition 2s p-4 rounded-b-lg w-[300px] md:w-[400px] lg:w-[800px]">{children}</CollapsibleContent>
        </Collapsible>
    );
};