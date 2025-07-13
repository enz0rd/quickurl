"use client"
import FooterInfo from "@/components/FooterInfo";
import Header from "@/app/header";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Page() {

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!loading) {
            setLoading(true);
            handleSubscriptionValidation();
        }
    }, []);

    const handleSubscriptionValidation = async () => {
        setLoading(true);
        try {

            const { searchParams } = new URL(window.location.href);
            const sessionId = searchParams.get("session_id");

            if (!sessionId) {
                console.error("Session ID not found in URL");
                toast.error("Failed to validate subscription. Please try again later.", {
                    duration: 5000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setLoading(false);
                return;
            }

            const token = localStorage.getItem("token");
            if (token) {
                const validateSubscription = await fetch("/api/subscription/validate-subscription", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token,
                        "stripe-session": sessionId
                    },
                });

                if (validateSubscription.ok) {
                    const result = await validateSubscription.json();
                    localStorage.setItem("userPlan", result.userPlan);
                    toast.success("Subscription validated successfully!", {
                        duration: 5000,
                        position: "bottom-center",
                        icon: "🚀",
                        style: { backgroundColor: "#005f08", color: "#fff" },
                      });

                    setTimeout(() => window.location.href = "/dashboard", 3000);
                } else {
                    toast.error("Failed to validate subscription. Please try again later.", {
                        duration: 5000,
                        position: "bottom-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                    });
                    console.error("Failed to validate subscription:", validateSubscription.statusText);
                }
            } else {
                toast.error("Failed to validate subscription. Please try again later.", {
                    duration: 5000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
            }
            setLoading(false);
        } catch (error) {
            toast.error("Failed to validate subscription. Please try again later.", {
                duration: 5000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
            setLoading(false);
        }
    }

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <Header />
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <div className="flex flex-col gap-2 items-center m-auto">
                    <h1 className="text-4xl font-bold text-center">
                        {loading ? (<div className="flex gap-3 items-center"><Loader className="w-12 h-12 animate-spin my-auto" /><span className="my-auto">validating subscription</span></div>) : "thank you for your subscription"}
                    </h1>
                    <p className="text-gray-500 text-md mx-2 text-wrap text-center">
                        {loading ?
                            "Please wait while we validate your subscription..." :
                            "now you can use all of the features of quickurl"
                        }
                    </p>
                </div>
                <Toaster />
            </main>
            <FooterInfo />
        </div>
    );
};