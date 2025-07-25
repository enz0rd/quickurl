import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader, Plus, X } from "lucide-react";
import React, { useState } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const formSchema = z.object({
  name: z
    .string()
    .min(5, { message: "app name should have at least 5 characters" })
    .max(30, { message: "App name should have 30 characters at most" }),
  expiresAt: z.string().optional(),
});

type formValues = z.infer<typeof formSchema>;

export default function CreateKeyDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(formSchema),
    values: {
      name: "",
      expiresAt: undefined,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onError = (errors: any) => {
    if (errors.name) {
      toast.error(errors.name.message || "Please enter a valid app name", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    } else {
      toast.error(
        errors.expiresAt.message || "Please enter a valid expiration date",
        {
          duration: 3000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        }
      );
    }
  };

  const onSubmit = async (data: formValues) => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/keys/create", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: localStorage.getItem("token") || "",
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        toast.error(
          result.error || "Failed to create API Key. Please try again later.",
          {
            duration: 10000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          }
        );
        return;
      }

      toast.success("Api key created successfully", {
        duration: 5000,
        position: "bottom-center",
        icon: "✅",
        style: { backgroundColor: "#005f08", color: "#fff" },
      });

      return setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.log(error);
      toast.error("Error creating api key, please try again later", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={() => {setIsOpen(true); reset(); }}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-lime-500 text-zinc-900 border-lime-400 hover:bg-lime-500/80 cursor-pointer"
        >
          api key <Plus className="ml-2 h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-zinc-500 w-[300px] sm:w-[400px]">
        <AlertDialogHeader className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <AlertDialogTitle className="font-semibold">
              Create API Key
            </AlertDialogTitle>
            <p className="text-sm text-zinc-400">Create a new api key</p>
          </div>
          <X
            className="w-6 h-6 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </AlertDialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-zinc-400 pl-2"
            >
              app name *
            </label>
            <Input
              type="text"
              className="border-zinc-500 text-zinc-300 rounded-lg h-[2.5rem] py-2 px-2 bg-zinc-950"
              placeholder="a beautiful app name"
              maxLength={30}
              {...register("name")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="expiresAt"
              className="text-sm font-semibold text-zinc-400 pl-2"
            >
              expires at
            </label>
            <Input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="border-zinc-500 text-zinc-300 rounded-lg h-[2.5rem] py-2 px-2 bg-zinc-950 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              maxLength={30}
              {...register("expiresAt")}
            />
          </div>
          <AlertDialogFooter className="flex mt-4 w-full">
            <div className="flex flex-row items-center w-full justify-between">
              <span
                className="py-1 px-2 text-sm font-medium text-zinc-400 cursor-pointer hover:text-zinc-200"
                onClick={() => setIsOpen(false)}
              >
                back
              </span>
              <Button
                type="submit"
                className="cursor-pointer bg-lime-500 hover:bg-lime-500/60 text-zinc-900 w-24"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  "submit"
                )}
              </Button>
            </div>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
