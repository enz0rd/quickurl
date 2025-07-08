'use client';
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Loader, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import toast from "react-hot-toast";

const formSchema = z.object({
    code: z.string().min(1).transform((val) => val.replace(/\s+/g, ""))
});

type FormValues = z.infer<typeof formSchema>;

export default function TwoFAModal({ onActivate2FA }: { onActivate2FA: () => void }) {
    const [isLoadingQRCode, setIsLoadingQRCode] = useState(true);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
        },
    });

    useEffect(() => {
        const fetchQRCode = async () => {
            try {
                const response = await fetch('/api/auth/2fa/qrcode', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('token') || '',
                    },
                });
                const data = await response.json();
                setQrCodeData(data.data);
                setIsLoadingQRCode(false);
            } catch (error) {
                console.error('Error fetching QR code:', error);
                setIsLoadingQRCode(false);
            }
        };
        if (!qrCodeData) {
            fetchQRCode();
        }
    }, [qrCodeData]);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token') || '',
                },
                body: JSON.stringify(data),
            });
            if(!response.ok) {
                if(response.status === 401) {
                    toast.error("Invalid 2FA code", {
                        duration: 3000,
                        position: "bottom-center",
                        icon: "🚫",
                          style: { backgroundColor: "#790000", color: "#fff" },
                      });
                    setIsLoading(false);
                    return;
                }
                toast.error("Error submitting 2FA code", {
                    duration: 3000,
                    position: "bottom-center",
                    icon: "🚫",
                      style: { backgroundColor: "#790000", color: "#fff" },
                  });
                setIsLoading(false);
                return;
            }

            toast.success("2FA enabled successfully", {
                duration: 3000,
                position: "bottom-center",
                icon: "✅",
                  style: { backgroundColor: "#007900", color: "#fff" },
                });

            setTimeout(() => {
                onActivate2FA();
                setIsLoading(false);
                setIsOpen(false);
            }, 2000);
        } catch(error) {
            toast.error("Error submitting 2FA code", {
                duration: 3000,
                position: "bottom-center",
                icon: "🚫",
                  style: { backgroundColor: "#790000", color: "#fff" },
              });
              setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={() => { setIsOpen(true); reset(); }}>
            <AlertDialogTrigger asChild>
                <Button className="text-zinc-950 bg-zinc-200 hover:bg-zinc-200/60 cursor-pointer w-24">enable</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-500 w-[300px] flex flex-col gap-4 justify-center">
                <AlertDialogHeader className="flex flex-row justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <AlertDialogTitle>Enable 2FA</AlertDialogTitle>
                        <p className="text-zinc-400 text-sm">
                            Scan the QR code with your authenticator app to enable 2FA.
                        </p>
                    </div>
                    <X
                        onClick={() => setIsOpen(false)}
                        className="h-10 w-10 text-zinc-400 cursor-pointer"
                    />
                </AlertDialogHeader>
                {isLoadingQRCode ? (
                    <Loader className="w-6 h-6 animate-spin" />
                ) : (
                    <>
                        <img
                            className="rounded-lg"
                            src={qrCodeData || ''}
                        />
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="code">otp code</label>
                                <Input
                                    type="text"
                                    autoFocus
                                    placeholder="Enter OTP code"
                                    {...register("code")}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="bg-lime-500 w-full text-zinc-900 hover:bg-lime-500/60 cursor-pointer mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : "Submit"}
                            </Button>
                        </form>
                    </>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );
};