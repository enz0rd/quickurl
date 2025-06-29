"use client";
import { ArrowLeft, IdCardLanyard } from "lucide-react";
import Link from "next/link";
import React from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Page() {
  const {
    formState,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: FormSchema) => {
    alert("function under development, thanks for testing!")
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-4xl font-bold">login</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            keep and manage your links with ease
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col w-full mt-5"
          >
            <Input
              className="rounded-b-none border-zinc-600 bg-zinc-800/60"
              type="email"
              placeholder="Email"
              {...register("email")}
            />
            <Input
              className="rounded-t-none border-zinc-600 bg-zinc-800/60"
              type="password"
              placeholder="Password"
              {...register("password")}
            />
            <Button
              className="mt-5 bg-zinc-200 text-zinc-900 cursor-pointer hover:bg-zinc-300"
              type="submit"
            >
              Login
            </Button>
          </form>
        </div>
        <Link href="/register" className="flex flex-row m-auto gap-2 items-center">
          <IdCardLanyard className="w-4 h-4" />
          <p>register</p>
        </Link>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link href="/" className="flex flex-row gap-2 items-center">
          <ArrowLeft className="w-4 h-4" />
          <p>back to home</p>
        </Link>
      </footer>
    </div>
  );
}
