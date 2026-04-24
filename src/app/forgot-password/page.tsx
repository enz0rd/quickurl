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
import Header from "@/app/header";
import { Turnstile } from "@/app/Turnstile";
import { useState } from "react";
import { motion } from "framer-motion";

const formSchema = z.object({
    email: z.string().email(),
    turnstile: z.string().min(1, {
        message:
            "Please complete the captcha, if the captcha didn't load, please reload the page.",
    })
});

type FormSchema = z.infer<typeof formSchema>;

export default function Page() {
    const methods = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            turnstile: "",
        },
    });

    const onError = (errors: any) => {
        if (errors.email) {
            toast.error("Please enter a valid email", {
                duration: 3000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
        } else if (errors.turnstile) {
            toast.error(errors.turnstile.message || "Captcha is required", {
                duration: 3000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
        }
    };

    const [isSubmitting, setIsSubmitted] = useState(false);

    const onSubmit = async (data: FormSchema) => {
        try {
            setIsSubmitted(true);
            // send email through api
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                toast.error("An error occurred while processing your request.", {
                    duration: 3000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setIsSubmitted(false);
                return;
            }

            const result = await res.json();

            toast.success("Password reset link sent to your email", {
                duration: 3000,
                position: "bottom-center",
                icon: "🚀",
                style: { backgroundColor: "#007a00", color: "#fff" },
            });
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("An error occurred while processing your request.", {
                duration: 3000,
                position: "bottom-center",
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
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold"
                    >
                        reset password
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="text-gray-500 text-md mx-2 text-center text-wrap">
                        forgot your password? enter your email and we'll send you a link to reset it
                    </motion.p>
                    <FormProvider {...methods}>
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1 }}
                            onSubmit={methods.handleSubmit(onSubmit, onError)} className="flex mt-3 flex-col gap-4 w-full max-w-[300px]">
                            <Input
                                type="email"
                                placeholder="example@mail.com"
                                {...methods.register("email")}
                                className="bg-zinc-950 text-zinc-300"
                            />
                            <input type="hidden" {...methods.register("turnstile")} />
                            <Turnstile />
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
                        </motion.form>
                    </FormProvider>
                </div>
                <Toaster />
            </main>
            <footer className="row-start-3 flex flex-col gap-[24px] flex-wrap items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                    className="flex w-full justify-center"
                >
                    <Link href="/" className="flex flex-row gap-2 items-center">
                        <ArrowLeft className="w-4 h-4" />
                        <p>back to home</p>
                    </Link>
                </motion.div>
                <FooterInfo />
            </footer>
        </div>
    );
};