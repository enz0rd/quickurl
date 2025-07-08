import { Loader, X } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { Input } from "./ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";


const formSchema = z.object({
  newEmail: z.string().email({
    message: "Please enter a valid email address",
  }).min(1, {
    message: "Please enter your new email",
  }),
  confirmNewEmail: z.string().email({
    message: "Please enter a valid email address",
  }).min(1, {
    message: "Please confirm your new email",
  }),
}).refine(data => data.newEmail === data.confirmNewEmail, {
  message: "Emails do not match",
  path: ["confirmNewEmail"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ChangeEmailModal({ actualEmail }: { actualEmail: string }) {

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newEmail: "",
      confirmNewEmail: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if(data.newEmail.trim() === actualEmail.trim()) {
      toast.error("Please enter a different email", {
        duration: 5000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/update-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || "",
        },
        body: JSON.stringify({
          email: data.newEmail.trim(),
        }),
      });

      if (!res.ok) {
        if (res.status == 401) {
          toast.error("You need to be logged in to change your email.", {
            duration: 5000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          })
          localStorage.removeItem("token");
          localStorage.removeItem("userPlan");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }
        toast.error("Failed to change email. Please try again later.", {
          duration: 5000,
          position: "bottom-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        })
      }
      const result = await res.json();
      toast.success(result.message || "Email change request sent. Please check your inbox to confirm.", {
        duration: 5000,
        position: "bottom-center",
        icon: "📧", 
        style: { backgroundColor: "#005f08", color: "#fff" },
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error changing email:', error);
      toast.error("Failed to change email. Please try again later.", {
        duration: 5000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
      setIsLoading(false);
      return;
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="bg-zinc-200 hover:bg-zinc-200/60 text-zinc-900 cursor-pointer w-24">
          change
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-zinc-500 w-[300px]">
        <AlertDialogHeader className="flex flex-row justify-between items-start">
          <AlertDialogTitle>Change Email</AlertDialogTitle>
          <X onClick={() => { setIsOpen(false) }} className="h-4 w-4 text-zinc-400 cursor-pointer" />
        </AlertDialogHeader>
        <AlertDialogDescription className="flex flex-col gap-1">
          <span className="text-zinc-400">Here you can change your email address. Please enter your new email address below and confirm the change.</span>
          <small className="text-zinc-500 text-xs">We'll send an email to the new email address to confirm</small>
        </AlertDialogDescription>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <div className="flex flex-col w-full gap-2 items-start">
            <label htmlFor="actualEmail" className="text-zinc-400 text-xs pl-2" >actual email</label>
            <span id="actualEmail" className="text-zinc-400 text-sm pl-2 bg-zinc-950/40 rounded-md py-2 px-1 border-zinc-400 border-1 w-full">{actualEmail}</span>
          </div>
          <div className="flex flex-col w-full gap-2 items-start">
            <label htmlFor="newEmail" className="text-zinc-400 text-xs pl-2" >new email</label>
            <Input id="newEmail" type="text" placeholder="example@mail.com" {...register("newEmail")} />
            {errors.newEmail && (
              <span className="text-red-500 text-xs pl-2">{errors.newEmail.message}</span>
            )}
          </div>
          <div className="flex flex-col w-full gap-2 items-start">
            <label htmlFor="confirmNewEmail" className="text-zinc-400 text-xs pl-2" >confirm email</label>
            <Input id="confirmNewEmail" type="text" placeholder="example@mail.com" {...register("confirmNewEmail")} />
            {errors.confirmNewEmail && (
              <span className="text-red-500 text-xs pl-2">{errors.confirmNewEmail.message}</span>
            )}
          </div>
          <Button
            type="submit"
            className="bg-lime-500 text-zinc-900 hover:bg-lime-500/60 cursor-pointer mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};