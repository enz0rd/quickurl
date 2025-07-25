import { Loader, Plus, X } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


const formSchema = z.object({
    name: z.string().min(6, { message: "Group name must have at least 6 characters" }).max(30, { message: "Group name must be 30 characters or less" }),
    description: z.string().max(100, { message: "Group description must be 100 characters or less" }).optional(),
    shortName: z.string().min(1, { message: "Please enter a group short name" }).max(4, { message: "Short name must be 4 characters or less" }),
})

type FormData = z.infer<typeof formSchema>;

export default function CreateGroupDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            shortName: "",
        }
    });

    async function handleCreateGroup(data: FormData) {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("You need to be logged in to create a group.", {
                    duration: 5000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000)
                return;
            }

            const res = await fetch('/api/groups/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const result = await res.json();

                if (res.status === 401) {
                    toast.error("You need to be logged in to create a group.", {
                        duration: 5000,
                        position: "bottom-center",
                        icon: "🚫",
                        style: { backgroundColor: "#790000", color: "#fff" },
                    });
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1000)
                    return;
                }
                toast.error(result.error || "Failed to create group. Please try again later.", {
                    duration: 5000,
                    position: "bottom-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                });
                setLoading(false);
                return;
            }

            toast.success("Group created successfully!", {
                duration: 5000,
                position: "bottom-center",
                icon: "✅",
                style: { backgroundColor: "#007500", color: "#fff" },
            });

            window.location.reload();

            setTimeout(() => {
                setLoading(false);
            }, 2000);
        } catch (error) {
            console.log(error);
            toast.error("Failed to create group. Please try again later.", {
                duration: 5000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
            setLoading(false);
            return;
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={() => { setOpen(true); reset(); }}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full bg-lime-500 text-zinc-900 border-lime-400 hover:bg-lime-500/80 cursor-pointer">
                    group <Plus className="ml-2 h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-500 rounded-xl md:w-fit w-[300px] justify-center">
                <AlertDialogHeader className="flex flex-row justify-between">
                    <div className="flex flex-col gap-2 justify-start items-start">
                        <AlertDialogTitle className="text-xl font-semibold">Create Group</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-zinc-500 text-start">Create a new group to organize your links</AlertDialogDescription>
                    </div>
                    <X className="h-4 w-4 text-zinc-500 cursor-pointer" onClick={() => setOpen(false)} />
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(handleCreateGroup)} className="flex flex-col mt-2 w-[250px] md:w-[300px]">
                    <div className="flex md:flex-row flex-col gap-3 w-full">
                        <div className="flex flex-col gap-1 md:w-[60%]">
                            <label htmlFor="name" className="text-sm text-zinc-500 pl-2">group name *</label>
                            <Input
                                type="text"
                                id="name"
                                placeholder="group name"
                                maxLength={30}
                                {...register("name")}
                            />
                            <small className="text-zinc-400 self-end pr-2">30 characters max</small>
                            {errors.name && <p className="text-xs text-red-500 pl-2">{errors.name.message}</p>}
                        </div>
                        <div className="flex flex-col gap-1 md:w-[40%]">
                            <label htmlFor="shortName" className="text-sm text-zinc-500 pl-2">short name *</label>
                            <Input
                                type="text"
                                id="shortName"
                                placeholder="QCK"
                                maxLength={4}
                                {...register("shortName")}
                            />
                            <small className="text-zinc-400 self-end pr-2">4 characters max</small>
                            {errors.name && <p className="text-xs text-red-500 pl-2">{errors.name.message}</p>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="description" className="text-sm text-zinc-500 pl-2">group name</label>
                        <Textarea
                            id="description"
                            placeholder="a well written group description"
                            {...register("description")}
                            maxLength={100}
                            wrap={'only'}
                            className="w-full resize-y min-h-24 max-h-96"
                        />
                        <small className="text-zinc-400 self-end pr-2">100 characters max</small>
                        {errors.description && <p className="text-xs text-red-500 pl-2">{errors.description.message}</p>}
                    </div>

                    <AlertDialogFooter className="flex flex-row justify-between w-full mt-5 items-center">
                        <span className="bg-transparent border-none text-zinc-400 cursor-pointer mr-auto ml-2 text-sm hover:text-zinc-200 transition 1s" onClick={() => setOpen(false)}>cancel</span>
                        <Button
                            type="submit"
                            className="bg-lime-500 text-zinc-900 hover:bg-lime-500/80 w-18 cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? (<Loader className="h-4 w-4 animate-spin" />) : "submit"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
};