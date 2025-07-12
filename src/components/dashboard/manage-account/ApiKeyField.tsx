import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function ApiKeyField({ apiKey }: { apiKey: string }) {
    const [isShown, setIsShown] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    return (
        <div className="w-full flex flex-col gap-1">
            <span className="text-sm text-zinc-300 font-bold pl-2">api key</span>
            <div className="w-full flex flex-row gap-2 items-center">
                <Input
                    type={isShown ? "text" : "password"}
                    className="w-full truncate"
                    value={apiKey || ""}
                    onChange={(e) => e.target.value = apiKey}
                    placeholder="api key"
                    contentEditable={false}
                    onClick={(e) => {
                        setIsCopied(true)
                        navigator.clipboard.writeText(apiKey)
                        setTimeout(() => setIsCopied(false), 2000)
                    }}
                />
                {isShown ? (
                    <EyeOff
                        className="w-5 h-5 cursor-pointer mx-2"
                        onClick={() => setIsShown(!isShown)}
                    />
                ) : (
                    <Eye className="w-5 h-5 cursor-pointer mx-2" onClick={() => setIsShown(!isShown)} />
                )}
            </div>
            {isCopied && <small className="text-lime-400 self-start pl-2">copied!</small>}
            <small className="text-zinc-400 self-start pl-2 mb-2">be careful! do not share this key. click to copy</small>
        </div>
    );
};