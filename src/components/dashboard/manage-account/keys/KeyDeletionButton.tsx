import BorderGlow from "@/components/BorderGlow";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CircleMinus, Loader, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

type KeyData = {
  index: number;
  id: string;
  name: string;
};

export default function KeyDeletionButton({
  variant = "default",
  keyData,
}: {
  variant: "default" | "icon";
  keyData: KeyData;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteKey = async (id: string) => {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/keys/delete?keyId=${id}`, {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          Authorization: localStorage.getItem("token") || "",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        toast.error(
          result.error || "Failed to delete API Key. Please try again later.",
          {
            duration: 10000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          }
        );
        return;
      }

      toast.success("Api key deleted successfully", {
        duration: 5000,
        position: "bottom-center",
        icon: "✅",
        style: { backgroundColor: "#005f08", color: "#fff" },
      });

      return setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.log(error);
      toast.error("Error deleting api key, please try again later", {
        duration: 5000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setIsLoading(false);
      return;
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild className="w-full h-full">
        {variant === "default" ? (
          <span className="text-white text-sm">delete</span>
        ) : (
          <div title="delete">
            <CircleMinus className="h-4 w-4 text-zinc-300" />
          </div>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-transparent border-none p-0 rounded-xl md:w-fit w-[300px] justify-center">
        <BorderGlow
          edgeSensitivity={30}
          glowColor="174 190 0"
          borderRadius={16}
          glowRadius={12}
          glowIntensity={2}
          coneSpread={15}
          animated={true}
          colors={["#7ccf00"]}
          backgroundColor="#18181b"
          className=" m-auto w-fit p-6"
        >
          <AlertDialogHeader className="flex flex-row justify-between">
            <div className="flex flex-col gap-2">
              <AlertDialogTitle className="font-semibold">
                Delete api key
              </AlertDialogTitle>
              <p className="text-sm text-zinc-400">
                Deleting api key nº{keyData.index}
              </p>
            </div>
            <X className="w-6 h-6" onClick={() => setIsOpen(false)} />
          </AlertDialogHeader>
          <AlertDialogDescription className="mt-3 mb-7">
            You are deleting the key named{" "}
            <span className="text-lime-500">{keyData.name}</span>. Are you sure?
          </AlertDialogDescription>
          <AlertDialogFooter className="flex flex-col md:flex-row md:justify-between gap-2 w-full">
            <AlertDialogCancel asChild>
              <Button
                variant={"outline"}
                className="cursor-pointer md:w-24 border-zinc-500 hover:border-zinc-300 hover:text-zinc-700 text-zinc-500"
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <Button
              variant={"destructive"}
              className="cursor-pointer md:w-24"
              onClick={() => handleDeleteKey(keyData.id)}
              disabled={isLoading}
            >
              {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </BorderGlow>
      </AlertDialogContent>
    </AlertDialog>
  );
}
