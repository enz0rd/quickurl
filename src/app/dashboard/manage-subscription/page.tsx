'use client';
import Header from "@/app/header";
import CancelSubscriptionButton from "@/components/dashboard/manage-subscription/CancelSubscriptionButton";
import FooterInfo from "@/components/FooterInfo";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

type SubscriptionData = {
    amount: number,
    cardLast4: string,
    lastPaymentDate: string,
    nextPaymentDate: string, 
    productName: string,
    status: string,
    subscriptionId: string
}

export default function Page() {
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
        amount: 0,
        cardLast4: "",
        lastPaymentDate: "",
        nextPaymentDate: "",
        productName: "",
        status: "",
        subscriptionId: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            const userPlan = localStorage.getItem("userPlan");
            if (!token || !userPlan) {
                toast.error("You need to be logged in to access this page.", {
                    duration: 10000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setTimeout(() => window.location.href = "/login", 2000);
            }

            const res = await fetch("/api/subscription/fetch-subscription-data", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token || "",
                    "userPlan": userPlan || ""
                }
            });

            if (!res.ok) {
                toast.error("Failed to fetch subscription data. Please try again later.", {
                    duration: 10000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                return;
            }

            const data = await res.json();
            setSubscriptionData(data);
            setIsFetchingData(false);
        }
        if (isFetchingData) {
            fetchData();
        }
    })

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <Header />
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <div className="flex flex-col gap-2 items-center m-auto">
                    <h1 className="text-4xl font-bold">subscription</h1>
                    <p className="text-gray-500 text-md mx-2 text-wrap">
                        manage your subscription
                    </p>
                    {isFetchingData ? (
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500 text-md">Loading subscription data...</span>
                            <Loader className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mt-4"/>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-2 group items-center text-center">
                                <div className="flex flex-row gap-2">
                                    <span className="text-sm font-semibold">plan:</span>
                                    <span className="text-sm">{subscriptionData.productName}</span>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <span className="text-sm font-semibold">price:</span>
                                    <span className="text-sm">${subscriptionData.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <span className="text-sm font-semibold">last payment:</span>
                                    <span className="text-sm">{subscriptionData.lastPaymentDate == "never" ? "never" : new Date(subscriptionData.lastPaymentDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <span className="text-sm font-semibold">next payment date:</span>
                                    <span className="text-sm">{subscriptionData.nextPaymentDate == "never" ? "never" : new Date(subscriptionData.nextPaymentDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <span className="text-sm font-semibold">card used:</span>
                                    <span className="text-sm">{subscriptionData.cardLast4 == "" ? "none" : (<>**** **** **** {subscriptionData.cardLast4}</>)}</span>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <span className="text-sm font-semibold">status:</span>
                                    <span className="text-sm">{subscriptionData.status}</span>
                                </div>
                            </div>
                            {subscriptionData.productName !== "free plan" && subscriptionData.status !== "canceled" && (
                                <CancelSubscriptionButton subscriptionId={subscriptionData.subscriptionId} />
                            )}
                        </>
                    )}
                </div>
                <Toaster />
            </main>
            <FooterInfo />
        </div>
    );
};