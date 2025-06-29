"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IdCardLanyard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useForm, FormProvider, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Turnstile } from "../Turnstile";
import toast, { Toaster } from "react-hot-toast";

const formSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    turnstile: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormSchema = z.infer<typeof formSchema>;

export default function Page() {
  const methods = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      turnstile: "",
    },
  });

  const {
    formState,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onError = (errors: FieldErrors<FormSchema>) => {
    if(errors.email) {
        toast.error("Please enter a valid email", {
          duration: 3000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
    } else if (errors.password) {
      toast.error("Password is required", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    } else if (errors.confirmPassword) {
      toast.error("Passwords do not match", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    } else if (errors.turnstile) {
      toast.error(
        "Please verify that you are human by completing the captcha.",
        {
          duration: 3000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        }
      );
    }
  };

  const onSubmit = (data: FormSchema) => {
    alert("function under development, thanks for testing!")
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-4xl font-bold">register</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            keep and manage your links with ease
          </p>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className="flex flex-col w-full mt-5"
            >
              <Input
                className="rounded-b-none border-zinc-600 bg-zinc-800/60"
                type="email"
                placeholder="Email"
                {...register("email")}
              />
              <Input
                className="rounded-none border-zinc-600 bg-zinc-800/60"
                type="password"
                placeholder="Password"
                {...register("password")}
              />
              <Input
                className="rounded-t-none mb-3 border-zinc-600 bg-zinc-800/60"
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />
              <input type="hidden" {...register("turnstile")} />
              <Turnstile />
              <Button
                className="mt-5 bg-zinc-200 text-zinc-900 cursor-pointer hover:bg-zinc-300"
                type="submit"
              >
                register
              </Button>
            </form>
          </FormProvider>
        </div>
        <Link href="/login" className="flex flex-row m-auto gap-2 items-center">
          <IdCardLanyard className="w-4 h-4" />
          <p>login</p>
        </Link>
      </main>
      <Toaster />
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link href="/" className="flex flex-row gap-2 items-center">
          <ArrowLeft className="w-4 h-4" />
          <p>back to home</p>
        </Link>
      </footer>
    </div>
  );
}
