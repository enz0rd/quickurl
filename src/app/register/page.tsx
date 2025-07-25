"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IdCardLanyard, ArrowLeft, Loader } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useForm, FormProvider, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Turnstile } from "@/app/Turnstile";
import toast, { Toaster } from "react-hot-toast";
import FooterInfo from "@/components/FooterInfo";
import Header from "@/app/header";

const formSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long",
    }),
    confirmPassword: z.string().min(8, {
      message: "Confirm Password must be at least 8 characters long",
    }),
    turnstile: z.string().min(1, {
      message:
        "Please complete the captcha, if the captcha didn't load, please reload the page.",
    }),
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
    if (errors.email) {
      toast.error("Please enter a valid email", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    } else if (errors.password) {
      toast.error(errors.password.message || "Password is required", {
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
        errors.turnstile.message ||
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

  const [isRegistering, setIsRegistering] = React.useState(false);

  const onSubmit = async (data: FormSchema) => {
    try {
      setIsRegistering(true);

      const { searchParams } = new URL(window.location.href);
      const redirectTo = searchParams.get("from") || "";
      let apiURL = ''
      
      // if the user comes from pricing page, we redirect them to checkout after registration
      if (redirectTo == 'pricing') {
        apiURL = "/api/auth/register?redirectTo=pricing";
      } else {
        apiURL = "/api/auth/register";
      }
      const res = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Registration failed");
      }

      const token = result.token;

      localStorage.setItem("token", token);
      localStorage.setItem("userPlan", result.userPlan);

      // if the user comes from pricing page, we redirect them to checkout after registration
      if (redirectTo !== "") {
        toast.success("Registration successful, redirecting to checkout...", {
          duration: 5000,
          position: "bottom-center",
          icon: "🚀",
          style: { backgroundColor: "#005f08", color: "#fff" },
        });

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
          return window.location.href = checkoutUrl;
        } else {
          setIsRegistering(false);
          toast.error("An error occurred while trying to proceed to checkout. Please login and try again on pricing page.", {
            duration: 5000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
        }
      }

      toast.success("Registration successful, redirecting to login...", {
        duration: 5000,
        position: "bottom-center",
        icon: "🚀",
        style: { backgroundColor: "#005f08", color: "#fff" },
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      setIsRegistering(false);
      console.error("Registration error:", error);
      toast.error(
        error.message ||
        "An error occurred while registering. Please try again.",
        {
          duration: 5000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        }
      );
      return;
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
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
                {isRegistering ? <Loader className="animate-spin" /> : "register"}
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
      <footer className="row-start-3 flex flex-col gap-[24px] flex-wrap items-center justify-center">
        <Link href="/" className="flex flex-row gap-2 items-center">
          <ArrowLeft className="w-4 h-4" />
          <p>back to home</p>
        </Link>
        <FooterInfo />
      </footer>
    </div>
  );
}
