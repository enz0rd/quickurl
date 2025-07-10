"use client"
import FooterInfo from "@/components/FooterInfo";
import Header from "../header";
import { useState } from "react";
import { Loader } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
    password: z.string().min(1, "your password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {

    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
        },
    });

    const handleEmailConfirm = async (data: FormValues) => {
        setLoading(true);
        setIsSubmitting(true);
        try {
            const { searchParams } = new URL(window.location.href);
            const token = searchParams.get("token");

            if (token) {
                const res = await fetch("/api/auth/2fa/confirm-reset-two-factor", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        resetToken: token,
                        password: data.password,
                    })
                });

                if (res.ok) {
                    toast.success("2FA reset successfully! Redirecting to login.", {
                        duration: 5000,
                        position: "bottom-center",
                        icon: "🚀",
                        style: { backgroundColor: "#005f08", color: "#fff" },
                    });
                    localStorage.removeItem("token");
                    localStorage.removeItem("userPlan");
                    setTimeout(() => window.location.href = "/login", 3000);
                } else {
                    if (res.status === 401) {
                        toast.error("Invalid password. Please try again.", {
                            duration: 5000,
                            position: "bottom-center",
                            icon: "🚫",
                            style: { backgroundColor: "#790000", color: "#fff" },
                        });
                        setLoading(false);
                        setIsSubmitting(false);
                        return;
                    }

                    const result = await res.json();
                    toast.error("Failed to reset 2FA. Please try again later.", {
                        duration: 5000,
                        position: "bottom-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                    });
                    console.error("Failed to validate subscription:", result.error);
                    return;
                }
            } else {
                toast.error("Failed to reset 2FA. Please try again later.", {
                    duration: 5000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                return;
            }
            setLoading(false);
        } catch (error) {
            toast.error("Failed to reset 2FA. Please try again later.", {
                duration: 5000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
            setLoading(false);
            return;
        }
    }

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <Header />
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <div className="flex flex-col gap-2 items-center m-auto">
                    {isSubmitting ? (
                        <>
                            <h1 className="text-4xl font-bold text-center">
                                {loading ? (<div className="flex gap-3 items-center"><Loader className="w-12 h-12 animate-spin my-auto" /><span className="my-auto">resetting 2FA</span></div>) : "2FA reset successfully"}
                            </h1>
                            <p className="text-gray-500 text-md mx-2 text-wrap text-center">
                                {loading ?
                                    "Please wait while we validate your request..." :
                                    "2FA for your account has been successfully reset! You will be redirected to the login page shortly."
                                }
                            </p>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit(handleEmailConfirm)} className="flex flex-col gap-2 justify-center items-center w-[300px]">
                            <h1 className="text-2xl font-bold text-center">just one more step</h1>
                            <p className="text-gray-500 text-sm mx-2 text-wrap text-center mt-2">
                                Please confirm your password to reset 2FA.
                            </p>

                            <div className="flex flex-col gap-2 w-[200px] mx-auto">
                                <label
                                    htmlFor="password"
                                    className="text-xs text-zinc-400 pl-2"
                                >
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    id="password"
                                    {...register("password")}
                                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                            <Button disabled={loading} type="submit" className="w-[200px] bg-lime-500 text-zinc-900 hover:bg-lime-500/60 cursor-pointer">
                                Confirm
                            </Button>
                        </form>
                    )}
                </div>
                <Toaster />
            </main>
            <FooterInfo />
        </div>
    );
};