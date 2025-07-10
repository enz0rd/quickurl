"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, FieldErrors } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import { Turnstile } from "./Turnstile";
import { urlShortenerFormSchema } from "@/lib/schema";
import { Check, Loader } from "lucide-react";
import GroupCombobox from "@/components/GroupCombobox";

type FormSchema = z.infer<typeof urlShortenerFormSchema>;

export default function ShortenUrlForm() {
  const methods = useForm<FormSchema>({
    resolver: zodResolver(urlShortenerFormSchema),
    defaultValues: {
      url: "",
      turnstile: "",
      groupId: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue
  } = methods;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

  const [isReturnedLink, setIsReturnedLink] = useState(false);
  const [returnedLink, setReturnedLink] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: FormSchema) => {
    setSubmitted(true);
    setIsReturnedLink(false);
    setReturnedLink("");
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
      setSubmitted(false);
      setIsReturnedLink(false);
      setReturnedLink("");
      return;
    }
    
    if(data.url.includes("quickurl.com.br")) {
      toast.error("Cannot shorten a url with 'quickurl.com.br'", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      }
      );
      setSubmitted(false);
      setIsReturnedLink(false);
      setReturnedLink("");
      return;
    }

    const authToken = window.localStorage.getItem("token") || "";

    const res = await fetch("/api/short", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json",
        Authorization: authToken,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error("Something went wrong, please try again later", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setSubmitted(false);
      setIsReturnedLink(false);
      setReturnedLink("");
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
      methods.reset();
      setReturnedLink(json.shortenedUrl);
      setIsReturnedLink(true);
      setSubmitted(false);
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

  const [Copied, setCopied] = useState(false);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col m-auto"
      >
        <div className="flex flex-row items-center group m-auto">
          <input
            className="border-1 border-zinc-600 rounded-bl-xl rounded-tl-xl h-[3rem] 
            px-4 py-2 group-hover:border-zinc-500 transition-all duration-300
            focus:outline-none"
            type="text"
            placeholder="https://example.com"
            {...register("url")}
          />
          <button
            className="bg-zinc-600 border-1 cursor-pointer border-zinc-600 
            text-white px-4 py-2 h-[3rem] group-hover:border-zinc-500 group-hover:bg-zinc-500 transition-all 
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
        <div className="mt-2 flex flex-col justify-center gap-2">
          {isLoggedIn && (
            <GroupCombobox
              variant="default"
              onSelectValue={(value) => setValue("groupId", typeof value === "string" ? value : value?.id)}
            />
          )}
          <Turnstile />
        </div>
        <div
          className={`${
            isReturnedLink ? "visible" : "hidden"
          } flex flex-col gap-2 rounded-lg mt-5 bg-zinc-200 text-zinc-900 py-3 px-4
          max-w-[300px]`}
        >
          <span className="text-sm">shortened url:</span>
          <span
            onClick={() => {
              navigator.clipboard.writeText(returnedLink)
              setCopied(true);
              toast.success("Copied to clipboard", {
                duration: 2000,
                position: "bottom-center",
                icon: "📋",
                style: { backgroundColor: "#005f08", color: "#fff" },
              });
              setTimeout(() => setCopied(false), 2000);
            }}
            className="font-semibold text-md truncate cursor-pointer"
          >
            {Copied ? <Check className="h-4 w-4" /> : returnedLink}
          </span>
          <small>Click to copy to clipboard</small>
        </div>
        <Toaster />
      </form>
    </FormProvider>
  );
}
