import toast, { Toaster } from "react-hot-toast";
import { AlertDialog, AlertDialogCancel, AlertDialogFooter, AlertDialogTitle, AlertDialogHeader, AlertDialogContent, AlertDialogTrigger, AlertDialogDescription } from "./ui/alert-dialog";
import { useState } from "react";
import { Loader, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

export function LinkDeletionButton({ slug }: { slug: string }) {

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const deleteLink = async (slug: string) => {
        setOpen(true);
        setLoading(true);
        try {
            const response = await fetch(`/api/links/delete?slug=${slug}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token') || '',
                }
            });
            if(response.ok) {
                toast.success('Link deleted successfully', {
                    duration: 5000,
                    position: "top-center",
                    icon: "🚀",
                    style: { backgroundColor: "#005f08", color: "#fff" },
                  });
                setTimeout(() => {
                    setOpen(false);
                    window.location.reload();
                }, 2000);
            } else if(response.status === 404) {
                toast.error('Link not found', {
                    duration: 5000,
                    position: "top-center",
                    icon: "🚫",
                    style: { backgroundColor: "#790000", color: "#fff" },
                  });
                setTimeout(() => {
                    setOpen(false);
                }, 2000);
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
            toast.error('Failed to delete link', {
                duration: 5000,
                position: "top-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
              });
            setTimeout(() => {
                setOpen(false);
            }, 2000);
        }
    }

    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger>
                    <span className='text-zinc-300 cursor-pointer'><Trash2 className='w-4 h-4' /></span>
                </AlertDialogTrigger>
                <AlertDialogContent className='bg-zinc-900'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to delete link <span className='text-lime-500'>{slug}</span>.
                            This action cannot be undone. This will permanently delete the link
                            and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='flex md:flex-row flex-col w-full'>
                        <AlertDialogCancel className='hover:text-zinc-700 text-zinc-800 hover:bg-zinc-200/80 cursor-pointer'>Cancel</AlertDialogCancel>
                        <Button onClick={() => deleteLink(slug)} disabled={loading} className='bg-red-500/60 hover:bg-red-500/60 cursor-pointer'>
                            {loading ? <Loader className='w-4 h-4 animate-spin' /> : 'Delete'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Toaster position="bottom-center" />
        </>
    );
};