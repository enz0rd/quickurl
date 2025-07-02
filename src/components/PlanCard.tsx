import { ArrowRight, Check, Loader, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";

export function PlanCard() {
    const [loading, setLoading] = useState(false);
    const handleGetStarted = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (token) {
                const createCheckout = await fetch("/api/subscription/create-checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token,
                    },
                    body: JSON.stringify({ plan: "pro" }),
                });

                if (createCheckout.ok) {
                    const { checkoutUrl } = await createCheckout.json();
                    window.location.href = checkoutUrl;
                } else if(createCheckout.status === 400) {
                    setLoading(false);
                    const { error } = await createCheckout.json();
                    toast.error(error, {
                        duration: 5000,
                        position: "top-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                      });
                } else {
                    setLoading(false);
                    toast.error("An error occurred while trying to get started. Please try again later.", {
                        duration: 5000,
                        position: "top-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                      });
                }
            } else {
                window.location.href = "/register?from=pricing";
            }
        } catch(error) {
            setLoading(false);
            console.error("Error handling get started:", error);
            toast.error("An error occurred while trying to get started. Please try again later.", {
                duration: 5000,
                position: "top-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
              });
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-2 p-4 rounded-xl">
            <div className="flex flex-col w-[300px] p-6 gap-2 items-center justify-between bg-zinc-950/40 p-4 rounded-lg">
                <span className="text-zinc-200 font-bold text-2xl">free plan</span>
                <div className="flex flex-col gap-2 w-full">
                    <span className="text-zinc-200 text-sm">plan features:</span>
                    <Table className="w-full rounded-lg overflow-hidden">
                        <TableHeader className="bg-zinc-800/60">
                            <TableRow>
                                <TableHead>
                                    <span className="text-zinc-200 font-bold text-sm">feature</span>
                                </TableHead>
                                <TableHead className="text-center">
                                    <span className="text-zinc-200 font-bold text-sm">included</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">control your links</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Check className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">unlimited links</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Check className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">custom link slug</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <X className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">custom amount of uses</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <X className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">custom expiration date</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <X className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">change original URL</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <X className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="flex flex-col gap-5 items-center justify-center w-full mt-2">
                        <div className="flex flex-row gap-4 w-full justify-center">

                            <span className="text-zinc-200 text-sm">already have an account?</span>
                            <Link href="/login" className="flex flex-row gap-2 items-center">
                                <span className="text-lime-500 text-sm font-bold my-auto">login</span>
                                <ArrowRight className="w-4 h-4 text-lime-500 my-auto" />
                            </Link>
                        </div>
                        <Button className="cursor-pointer bg-lime-500/60 hover:bg-lime-700/60 text-zinc-200 font-bold text-sm w-full">create an account</Button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-[300px] p-6 gap-2 items-center justify-between bg-lime-800 p-4 rounded-lg">
                <span className="text-zinc-200 font-bold text-2xl">pro plan</span>
                <div className="flex flex-col gap-2 w-full">
                    <span className="text-zinc-200 text-sm">plan features:</span>
                    <Table className="w-full rounded-lg overflow-hidden">
                        <TableHeader className="bg-zinc-800/60">
                            <TableRow>
                                <TableHead>
                                    <span className="text-zinc-200 font-bold text-sm">feature</span>
                                </TableHead>
                                <TableHead className="text-center">
                                    <span className="text-zinc-200 font-bold text-sm">included</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">control your links</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Check className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">unlimited links</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Check className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">custom link slug</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Check className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">custom amount of uses</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Check className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">custom expiration date</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Check className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <span className="text-zinc-200 text-sm">change original URL</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Check className="w-4 h-4 text-zinc-200 mx-auto" />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="flex flex-col gap-5 items-center justify-center w-full mt-2">
                        <div className="flex flex-row gap-4 w-full justify-center">
                            <span className="font-bold text-zinc-200 text-sm">$5/month</span>
                        </div>
                        <Button 
                            onClick={() => handleGetStarted()}
                            disabled={loading}
                            className="cursor-pointer bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-bold text-sm w-full"
                        >
                            {loading ? (<Loader className="w-4 h-4 mx-auto" />) : "get started"}</Button>
                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    );
};