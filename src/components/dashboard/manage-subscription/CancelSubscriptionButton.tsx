'use client';
import { useState } from "react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "lucide-react";

export default function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
  const [understand, setUnderstand] = useState(false);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    if (!understand) {
        setLoading(false);
        toast.error("You must confirm cancellation by checking the box.", {
            duration: 10000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
        });
        return;
    }
    
    const res = await fetch("/api/subscription/cancel-subscription", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token") || "",
            "userPlan": localStorage.getItem("userPlan") || ""
        },
        body: JSON.stringify({ subscriptionId })
    });
    
    if (!res.ok) {
        setLoading(false);
        toast.error("Failed to cancel subscription. Please try again later.", {
            duration: 10000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
        });
        return;
    }
    
    const data = await res.json();
    localStorage.setItem("userPlan", data.userPlan);
    
    toast.success("Subscription canceled successfully.", {
        duration: 5000,
        position: "bottom-center",
        icon: "✅",
        style: { backgroundColor: "#005f08", color: "#fff" },
    });
    setTimeout(() => {
        window.location.reload();
    }, 3000);
  }
  
    return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
            <Button variant={'destructive'} className="mt-5 cursor-pointer">
                cancel subscription
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-zinc-900">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold">
                    Cancel Subscription
                </AlertDialogTitle>
            </AlertDialogHeader>
            <p className="text-zinc-400">
                Are you sure you want to <b className="text-red-500">cancel</b> your subscription? You can renew your subscription at any time.
            </p>
            <p className="text-red-500">
                Please note that you will lose access to premium features immediately after cancellation.
            </p>
            <div className="flex flex-row items-center gap-2 cursor-pointer">
                <Checkbox checked={understand} onCheckedChange={() => setUnderstand(!understand)} className="border-1 w-4 h-4 bg-zinc-800 rounded-sm cursor-pointer data-[state=checked]:bg-red-500" id="confirmCancellation" />
                <label htmlFor="confirmCancellation" className="text-zinc-400">I understand and i really want to cancel my subscription</label>
            </div>
            <div className="flex md:flex-row flex-col gap-5 mt-3 justify-between items-center">
                <AlertDialogCancel onClick={() => setOpen(false)} className="border-none cursor-pointer bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg">
                        I don't want to cancel
                </AlertDialogCancel>
                <Button 
                    onClick={() => handleCancel()} 
                    className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    disabled={loading}>
                    {loading ? (<Loader className="w-4 h-4 animate-spin" />) : "Confirm Cancellation"} 
                </Button>
            </div>
        </AlertDialogContent>
      
    </AlertDialog>
  );
}