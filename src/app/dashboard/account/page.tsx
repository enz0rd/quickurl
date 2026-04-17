"use client";
import Header from "@/app/header";
import ChangeEmailModal from "@/components/dashboard/manage-account/ChangeEmailModal";
import DeleteAccountModal from "@/components/dashboard/manage-account/DeleteAccountModal";
import FooterInfo from "@/components/FooterInfo";
import TwoFAModal from "@/components/dashboard/manage-account/TwoFAModal";
import { Button } from "@/components/ui/button";
import {
  BadgePlus,
  Code2Icon,
  Import,
  Loader,
  LockIcon,
  Mail,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ImportLinksModal from "@/components/dashboard/manage-account/ImportLinksModal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

type Permissions = {
  allowEdit: boolean;
  allowDA: boolean;
  allowQRCode: boolean;
  allowExport: boolean;
  allowImport: boolean;
};

export default function Page() {
  const [permissions, setPermissions] = useState<Permissions>({
    allowEdit: false,
    allowDA: false,
    allowQRCode: false,
    allowExport: false,
    allowImport: false,
  });
  const [twoFA, setTwoFA] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to be logged in to access this page.", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setIsLoading(false);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }
    const plan = localStorage.getItem("userPlan");

    const res = await fetch("/api/user/fetch", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
        UserPlan: plan || "",
      },
    });
    if (!res.ok) {
      if (res.status == 401) {
        toast.error("You need to be logged in to access this page.", {
          duration: 3000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        setIsLoading(false);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }
      toast.error("Failed to fetch user data. Please try again later.", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setIsLoading(false);
      return;
    }
    const result = await res.json();
    setTwoFA(result.twoFAEnabled);
    setEmail(result.email);
    setPermissions(result.permissions);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      fetchData();
    } // Prevent multiple fetches
  }, [isLoading]);

  const deactivateTwoFA = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You need to be logged in to disable 2FA.", {
          duration: 3000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        setIsLoading(false);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }
      const res = await fetch("/api/auth/2fa/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (!res.ok) {
        if (res.status == 401) {
          toast.error("You need to be logged in to disable 2FA.", {
            duration: 3000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
          setIsLoading(false);
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          return;
        }
        toast.error("Failed to disable 2FA. Please try again later.", {
          duration: 3000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error deactivating 2FA:", error);
      return;
    }
    setTwoFA(false);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center m-auto">
          <h1 className="text-4xl font-bold">account</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            manage your account
          </p>
          <div className="flex flex-col gap-2 mt-5 w-full justify-center max-w-2xl">
            {isLoading ? (
              <Loader className="h-10 w-10 animate-spin mx-auto" />
            ) : (
              <>
                <div className="flex flex-row w-[300px] justify-between">
                  <span className="text-white text-md font-bold flex flex-row gap-2 items-center">
                    <Code2Icon size={18} /> api keys
                  </span>
                  <Button
                    variant={"default"}
                    onClick={() =>
                      (window.location.href = "/dashboard/account/api-keys")
                    }
                    className="bg-zinc-100 hover:bg-zinc-100/60 cursor-pointer w-24 text-zinc-900"
                  >
                    manage
                  </Button>
                </div>
                <div className="flex flex-row w-[300px] justify-between">
                  <span className="text-white text-md font-bold flex flex-row gap-2 items-center">
                    <LockIcon size={18} /> 2FA
                  </span>
                  {twoFA ? (
                    <Button
                      disabled={isLoading}
                      onClick={deactivateTwoFA}
                      variant="destructive"
                      className="hover:bg-red-500/60 cursor-pointer w-24"
                    >
                      {isLoading ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        "deactivate"
                      )}
                    </Button>
                  ) : (
                    <TwoFAModal onActivate2FA={() => setTwoFA(true)} />
                  )}
                </div>
                <div className="flex flex-row w-[300px] justify-between">
                  <span className="text-white text-md font-bold flex flex-row gap-2 items-center">
                    <Mail size={18} /> change email
                  </span>
                  <ChangeEmailModal actualEmail={email} />
                </div>
                <div className="flex flex-row w-[300px] justify-between">
                  <span className="text-white text-md font-bold flex flex-row gap-2 items-center">
                    <Import size={18} /> import links
                  </span>
                  {permissions.allowImport ? (
                    <ImportLinksModal />
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="bg-zinc-500 hover:bg-zinc-500/60 cursor-pointer text-zinc-900 w-24 items-center flex"
                        >
                          <span className="text-zinc-900">import</span>
                          <Star className="w-4 h-4 fill-zinc-900 my-auto" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="bg-zinc-950 flex flex-col gap-1"
                      >
                        <span className="flex gap-1 text-md font-bold items-center self-center">
                          Import links{" "}
                          <span className="bg-lime-500 px-1 py-.25 rounded-full text-xs text-zinc-900 flex gap-1 items-center">
                            new{" "}
                            <BadgePlus className="text-zinc-900" size={12} />
                          </span>
                        </span>
                        <p>this is a premium feature.</p>
                        <Link
                          href="/pricing"
                          className="text-lime-500 hover:text-lime-500/80"
                        >
                          learn more
                        </Link>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex flex-row w-[300px] justify-between">
                  <span className="text-white text-md font-bold flex flex-row gap-2 items-center">
                    <Trash2 size={18} /> delete account
                  </span>
                  <DeleteAccountModal />
                </div>
              </>
            )}
          </div>
        </div>
        <Toaster />
      </main>
      <FooterInfo />
    </div>
  );
}
