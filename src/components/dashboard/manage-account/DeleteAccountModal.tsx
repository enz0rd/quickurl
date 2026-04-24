import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import BorderGlow from "@/components/BorderGlow";

export default function DeleteAccountModal() {
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!consent) {
        return;
      }

      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
      });
      if (!res.ok) {
        if (res.status == 401) {
          toast.error("You need to be logged in to delete your account.", {
            duration: 10000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
          localStorage.removeItem("token");
          localStorage.removeItem("userPlan");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
          return;
        }
        toast.error("Failed to delete account. Please try again later.", {
          duration: 10000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        setIsLoading(false);
        return;
      }
      toast.success("Account deleted successfully", {
        duration: 5000,
        position: "bottom-center",
        icon: "😭",
        style: { backgroundColor: "#005181", color: "#fff" },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("userPlan");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      toast.error("Failed to delete account. Please try again later.", {
        duration: 10000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setIsLoading(false);
      return;
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="cursor-pointer hover:bg-red-500/60 w-24"
        >
          delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-transparent border-none p-0 rounded-xl md:w-fit w-[300px] justify-center">
        <BorderGlow
          edgeSensitivity={30}
          glowColor="0 255 0"
          borderRadius={16}
          glowRadius={12}
          glowIntensity={2}
          coneSpread={15}
          animated={true}
          colors={["#c40000"]}
          backgroundColor="#18181b"
          className=" m-auto w-fit p-6"
        >
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will{" "}
            <span className="text-red-500">permanently</span> delete your
            account and <span className="text-red-500">all of your data.</span>
          </AlertDialogDescription>
          <div className="flex flex-row w-full gap-2 items-start mt-5">
            <Checkbox
              onCheckedChange={(checked) => setConsent(checked === true)}
              checked={consent}
              className="mt-1 border-1 w-4 h-4 bg-red-900/60 border-red-500 rounded-sm cursor-pointer data-[state=checked]:bg-red-500"
              id="consent"
            />
            <label
              htmlFor="consent"
              className="cursor-pointer text-red-500 text-sm"
            >
              I understand that my account and links will be deleted and my
              subscription will be cancelled.
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="destructive"
              className="cursor-pointer hover:bg-red-500/60 "
              disabled={!consent || isLoading}
              onClick={handleDelete}
            >
              Delete
            </Button>
            <AlertDialogCancel asChild>
              <Button className="bg-lime-500 border-none text-zinc-900 cursor-pointer hover:bg-lime-500/60">
                I don't want to
              </Button>
            </AlertDialogCancel>
          </div>
        </BorderGlow>
      </AlertDialogContent>
    </AlertDialog>
  );
}
