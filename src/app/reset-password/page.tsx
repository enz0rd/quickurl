'use client';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import FooterInfo from "@/components/FooterInfo";
import Link from "next/link";
import { ArrowLeft, Loader } from "lucide-react";
import Header from "../header";
import { useState } from "react";

const formSchema = z.object({
    newPassword: z.string().min(8, {
        message: "Password must be at least 8 characters long.",
    }),
    confirmNewPassword: z.string().min(8, {
        message: "Confirm Password must be at least 8 characters long.",
    })
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  });;

type FormSchema = z.infer<typeof formSchema>;

export default function Page() {
    const methods = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    const onError = (errors: any) => {
        if (errors.newPassword) {
            toast.error(errors.newPassword.message || "Please enter a valid password", {
                duration: 3000,
                position: "top-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
        } else if (errors.confirmNewPassword) {
            toast.error(errors.confirmNewPassword.message || "Passwords do not match", {
                duration: 3000,
                position: "top-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
        }
    };

    const [isSubmitting, setIsSubmitted] = useState(false);

    const onSubmit = async (data: FormSchema) => {
        try {
            const resetToken = new URLSearchParams(window.location.search).get("token");

            if (!resetToken) {
                toast.error("Invalid or missing reset token.", {
                    duration: 3000,
                    position: "top-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                return;
            }

            setIsSubmitted(true);
            console.log(data)
            // validate password reset
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "password-reset-token": resetToken,
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) {
                if(res.status === 400) {
                    toast.error(result.error || "Invalid or missing reset token.", {
                        duration: 3000,
                        position: "top-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                    });
                    setIsSubmitted(false);
                    return;
                }
                if(res.status === 403) {
                    toast.error("Invalid or expired reset token.", {
                        duration: 3000,
                        position: "top-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                    });
                    setIsSubmitted(false);
                    return;
                }
                toast.error("An error occurred while processing your request.", {
                    duration: 3000,
                    position: "top-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setIsSubmitted(false);
                return;
            }

            console.log(result);


            toast.success("Password reset successfully", {
                duration: 3000,
                position: "top-center",
                icon: "🚀",
                style: { backgroundColor: "#007a00", color: "#fff" },
            });
            setTimeout(() => window.location.href = "/login", 3000);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("An error occurred while processing your request.", {
                duration: 3000,
                position: "top-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });

            setIsSubmitted(false);
        }
    };

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                <Header />
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-[80%] max-w-[500px]">
                <div className="flex flex-col gap-2 items-center">
                    <h1 className="text-4xl font-bold">reset password</h1>
                    <p className="text-gray-500 text-md mx-2 text-center text-wrap">
                        please enter your new password and confirm it below. Make sure to use a strong password that you haven't used before.
                    </p>
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="flex mt-3 flex-col gap-4 w-full max-w-[300px]">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="newPassword" className="text-sm text-zinc-300 font-semibold pl-2">
                                    new password
                                </label>
                                <Input
                                    type="password"
                                    placeholder="new password"
                                    {...methods.register("newPassword")}
                                    className="border-zinc-500 text-zinc-300"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="confirmNewPassword" className="text-sm text-zinc-300 font-semibold pl-2">
                                    confirm new password
                                </label>
                                <Input
                                    type="password"
                                    placeholder="confirm new password"
                                    {...methods.register("confirmNewPassword")}
                                    className="border-zinc-500 text-zinc-300"
                                />
                            </div>
                            <Button 
                                className="bg-zinc-200 text-zinc-900 cursor-pointer hover:bg-zinc-300"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader className="animate-spin"/>
                                ) : (
                                    "reset password"
                                )}
                            </Button>
                        </form>
                    </FormProvider>
                </div>
                <Toaster />
            </main>
            <footer className="row-start-3 flex flex-col gap-[24px] flex-wrap items-center justify-center">
                <Link href="/" className="flex flex-row gap-2 items-center">
                    <ArrowLeft className="w-4 h-4" />
                    <p>back to home</p>
                </Link>
                <FooterInfo />
            </footer>
        </div>
    );
};