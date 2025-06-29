"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, FieldErrors } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import { Turnstile } from "./Turnstile";
import { urlShortenerFormSchema } from "@/lib/schema";
import { Loader } from "lucide-react";

type FormSchema = z.infer<typeof urlShortenerFormSchema>;

export default function ShortenUrlForm() {
  const methods = useForm<FormSchema>({
    resolver: zodResolver(urlShortenerFormSchema),
    defaultValues: {
      url: "",
      turnstile: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const [isReturnedLink, setIsReturnedLink] = useState(false);
  const [returnedLink, setReturnedLink] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: FormSchema) => {
    const lastUrlShortened = JSON.parse(
      localStorage.getItem("lastUrlShortened") || "null"
    );
    const now = Date.now();

    if (
      lastUrlShortened &&
      data.url === lastUrlShortened.url &&
      now - lastUrlShortened.time < 5 * 60 * 1000
    ) {
      toast.error("Please wait 5 minutes to shorten this url again", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      }
      );
      return;
    }

    const authToken = window.localStorage.getItem("accessToken") || "";

    const res = await fetch("/api/short", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json",
        Authorization: authToken,
      },
    });

    alert(JSON.stringify(res));

    const json = await res.json();

    if (!res.ok) {
      toast.error("Something went wrong, please try again later", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    } else {
      window.localStorage.setItem(
        "lastUrlShortened",
        JSON.stringify({ url: data.url, time: now })
      );
      toast.success("URL shortened successfully", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚀",
        style: { backgroundColor: "#005f08", color: "#fff" },
      });
      setReturnedLink(json.shortenedUrl);
      setIsReturnedLink(true);
    }
  };

  const onError = (errors: FieldErrors<FormSchema>) => {
    if (errors.url) {
      toast.error("Please enter a valid URL", {
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

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col m-auto"
      >
        <div className="flex flex-row items-center group m-auto">
          <input
            className="border-1 border-gray-700 rounded-bl-xl rounded-tl-xl h-[3rem] 
            px-4 py-2 group-hover:border-gray-500 transition-all duration-300
            focus:outline-none"
            type="text"
            placeholder="https://example.com"
            {...register("url")}
          />
          <button
            className="bg-gray-700 border-1 cursor-pointer border-gray-700 
            text-white px-4 py-2 h-[3rem] group-hover:border-gray-500 group-hover:bg-gray-500 transition-all 
            duration-300 rounded-br-xl rounded-tr-xl font-bold"
            type="submit"
            disabled={submitted}
          >
            {submitted ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "shorten"
            )}
          </button>

          <input type="hidden" {...register("turnstile")} />
        </div>
        <div className="mt-2">
          <Turnstile />
        </div>
        <div
          className={`${
            isReturnedLink ? "visible" : "hidden"
          } flex flex-col gap-2 rounded-lg mt-5 bg-zinc-200 text-zinc-900 py-3 px-4`}
        >
          <span className="text-sm">shortened url:</span>
          <span
            onClick={() => navigator.clipboard.writeText(returnedLink)}
            className="font-semibold text-md"
          >
            {returnedLink}
          </span>
          <small>Click to copy to clipboard</small>
        </div>
        <Toaster />
      </form>
    </FormProvider>
  );
}
