'use client';
import Header from "@/app/header";
import ChangeEmailModal from "@/components/dashboard/manage-account/ChangeEmailModal";
import DeleteAccountModal from "@/components/dashboard/manage-account/DeleteAccountModal";
import FooterInfo from "@/components/FooterInfo";
import TwoFAModal from "@/components/dashboard/manage-account/TwoFAModal";
import { Button } from "@/components/ui/button";
import { Code2Icon, Loader, LockIcon, Mail, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function Page() {

    const [twoFA, setTwoFA] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("You need to be logged in to access this page.", {
                duration: 3000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
            setIsLoading(false);
            setTimeout(() => { window.location.href = "/login"; }, 2000);
            return;
        }
        const res = await fetch("/api/user/fetch", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
        })
        if (!res.ok) {
            if (res.status == 401) {
                toast.error("You need to be logged in to access this page.", {
                    duration: 3000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setIsLoading(false);
                setTimeout(() => { window.location.href = "/login"; }, 2000);
                return;
            }
            toast.error("Failed to fetch user data. Please try again later.", {
                duration: 3000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
            setIsLoading(false);
            return;
        }
        const result = await res.json();
        setTwoFA(result.twoFAEnabled);
        setEmail(result.email);
        setIsLoading(false);
    }
    
    useEffect(() => {
        if(isLoading) {
            fetchData();
        }; // Prevent multiple fetches
    }, [isLoading]);



    const deactivateTwoFA = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("You need to be logged in to disable 2FA.", {
                    duration: 3000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setIsLoading(false);
                setTimeout(() => { window.location.href = "/login"; }, 2000);
                return;
            }
            const res = await fetch("/api/auth/2fa/deactivate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
            });
            if (!res.ok) {
                if (res.status == 401) {
                    toast.error("You need to be logged in to disable 2FA.", {
                        duration: 3000,
                        position: "bottom-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                    });
                    setIsLoading(false);
                    setTimeout(() => { window.location.href = "/login"; }, 2000);
                    return;
                }
                toast.error("Failed to disable 2FA. Please try again later.", {
                    duration: 3000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setIsLoading(false);
                return;
            }
        } catch (error) {
            console.error("Error deactivating 2FA:", error);
            return;
        }
        setTwoFA(false);
    }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <Header />
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <div className="flex flex-col gap-2 items-center m-auto">
                    <h1 className="text-4xl font-bold">account</h1>
                    <p className="text-gray-500 text-md mx-2 text-wrap">
                        manage your account
                    </p>
                    <div className="flex flex-col gap-2 mt-5 w-full justify-center max-w-2xl">
                        {isLoading ? (
                            <Loader className="h-10 w-10 animate-spin mx-auto" />
                        ) : (
                            <>
                                <div className="flex flex-row w-[300px] justify-between">
                                    <span className="text-white text-md font-bold flex flex-row gap-2 items-center"><Code2Icon size={18} /> api keys</span>
                                    <Button variant={'default'} onClick={() => window.location.href = '/dashboard/account/api-keys'} className="bg-zinc-100 hover:bg-zinc-100/60 cursor-pointer w-24 text-zinc-900">manage</Button>
                                </div>
                                <div className="flex flex-row w-[300px] justify-between">
                                    <span className="text-white text-md font-bold flex flex-row gap-2 items-center"><LockIcon size={18} /> 2FA</span>
                                    {twoFA ? (
                                        <Button 
                                            disabled={isLoading} 
                                            onClick={deactivateTwoFA} 
                                            variant="destructive"
                                            className="hover:bg-red-500/60 cursor-pointer w-24">
                                            {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : "deactivate"}
                                        </Button>
                                    ) : (
                                        <TwoFAModal onActivate2FA={() => setTwoFA(true)} />
                                    )}
                                </div>
                                <div className="flex flex-row w-[300px] justify-between">
                                    <span className="text-white text-md font-bold flex flex-row gap-2 items-center"><Mail size={18} /> change email</span>
                                    <ChangeEmailModal actualEmail={email}/>
                                </div>
                                <div className="flex flex-row w-[300px] justify-between">
                                    <span className="text-white text-md font-bold flex flex-row gap-2 items-center"><Trash2 size={18} /> delete account</span>
                                    <DeleteAccountModal />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <Toaster />
            </main>
            <FooterInfo />
        </div>
  );
};