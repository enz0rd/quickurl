'use client';
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Loader, Lock, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import toast from "react-hot-toast";

const formSchema = z.object({
    code: z.string().min(1).transform((val) => val.replace(/\s+/g, ""))
});

type FormValues = z.infer<typeof formSchema>;

export default function TwoFALoginModal({ userEmail, open }: { userEmail: string, open: boolean }) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
        },
    });

    const [isLoading, setIsLoading] = useState(false);
    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    code: data.code
                }),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Invalid 2FA code", {
                        duration: 3000,
                        position: "bottom-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                    });
                    setIsLoading(false);
                    return;
                }
                toast.error("Error submitting 2FA code", {
                    duration: 3000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setIsLoading(false);
                return;
            }

            const result = await response.json();
            const { token, userPlan } = result;
            if (!token || !userPlan) {
                throw new Error("Invalid response from server");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("userPlan", userPlan);

            toast.success("Login successful, redirecting...", {
                duration: 5000,
                position: "bottom-center",
                icon: "🚀",
                style: { backgroundColor: "#005f08", color: "#fff" },
            });

            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);
        } catch (error) {
            toast.error("Error submitting 2FA code", {
                duration: 3000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
            setIsLoading(false);
        }
    };

    const handleReset2FA = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/2fa/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userEmail }),
            });
            if (!response.ok) {
                toast.error("Error resetting 2FA", {
                    duration: 3000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setIsLoading(false);
                return;
            }

            const result = await response.json();

            toast.success(result.message, {
                duration: 5000,
                position: "bottom-center",
                icon: "✅",
                style: { backgroundColor: "#005f08", color: "#fff" },
            });
            setTimeout(() => {
                window.location.reload();
            }, 5000);
            return;
        } catch (error) {
            toast.error("Error resetting 2FA", {
                duration: 3000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
            setIsLoading(false);
        }
    }

    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="z-[999] bg-zinc-900 border-zinc-500 w-[300px] flex flex-col gap-4 justify-center">
                <AlertDialogHeader className="flex flex-row justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <AlertDialogTitle className="flex flex-row gap-2 items-center font-bold"><Lock className="h-5 w-5" /> 2FA</AlertDialogTitle>
                        <p className="text-zinc-400 text-sm">
                            fill in the code on your authenticator app
                        </p>
                    </div>
                    <X className="h-5 w-5 cursor-pointer text-zinc-400 hover:text-zinc-200" onClick={() => { window.location.reload() }} />
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="code">otp code</label>
                        <Input
                            type="text"
                            autoFocus
                            placeholder="Enter OTP code"
                            {...register("code")}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="bg-lime-500 w-full text-zinc-900 hover:bg-lime-500/60 cursor-pointer mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : "Submit"}
                    </Button>
                    <Button className="bg-none border-none cursor-pointer text-zinc-400 text-xs mt-2 flex flex-row gap-2 items-center" 
                        onClick={handleReset2FA}
                        disabled={isLoading}
                    >doesn't have access anymore? {isLoading ? (<span> <Loader className="h-5 w-5 animate-spin" /></span>) : null}</Button>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
};