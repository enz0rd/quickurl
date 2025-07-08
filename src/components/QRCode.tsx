import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Download, Share, Star, X } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useQRCode } from "next-qrcode";
import toast from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export default function QRCode({
  permission,
  link,
}: {
  permission: boolean;
  link: string;
}) {
  const { Canvas } = useQRCode();

  const [ísOpen, setIsOpen] = useState(false);

  const qrRef = React.useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!navigator.canShare) {
      toast.error("unfortunately, your browser does not support sharing files or links.", {
        duration: 3000,
        position: "bottom-center",
        icon: "🚫",
        style: { backgroundColor: "#790000", color: "#fff" },
      });
    }

    if (!navigator.canShare({ files: [] })) {
      try {
        await navigator.share({
          title: "shortened link - quickurl",
          text: `sharing my shortened link via quickurl`,
          url: link,
        });
      } catch (err) {
        console.error("error when sharing:", err);
      }
    }

    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "qrcode.png", { type: "image/png" });

      try {
        await navigator.share({
          title: "QR Code - quickurl",
          text: `shortened link: ${link}`,
          files: [file],
        });
      } catch (err) {
        console.error("error when sharing:", err);
      }
    });
  };

  const handleDownload = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  };

  return permission ? (
    <AlertDialog open={ísOpen} onOpenChange={() => setIsOpen(true)}>
      <AlertDialogTrigger asChild>
        <div className="flex items-center justify-between w-full">
          <span className="text-zinc-200">qr code</span>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-zinc-500 w-fit">
        <AlertDialogHeader className="flex flex-row justify-between">
          <AlertDialogTitle className="mt-[-.5rem]">qrcode</AlertDialogTitle>
          <X
            className="w-4 h-4 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </AlertDialogHeader>
        <div
          ref={qrRef}
          className="flex flex-col rounded-lg items-center justify-center overflow-clip w-fit bg-zinc-950"
        >
          <Canvas
            text={link}
            options={{
              errorCorrectionLevel: "H",
              margin: 3,
              scale: 4,
              width: 300,
              color: {
                dark: "#84cc16",
                light: "#09090b",
              },
            }}
            logo={{
              src: "/assets/logo/png/quickurl_icon_bg.png",
            }}
          />
          <span className="text-zinc-500 text-xs mb-2 font-bold">
            {link}
          </span>
        </div>
        <div className="flex flex-col w-full mt-2 gap-2">
          <Button
            onClick={handleDownload}
            className="bg-zinc-200 text-zinc-900 hover:bg-zinc-300 cursor-pointer"
          >
            share <Share className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-lime-500 text-zinc-900 hover:bg-lime-500/90 cursor-pointer"
          >
            download png <Download className="h-4 w-4" />
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  ) : (
    <>
      {/* Tooltip para desktop */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="hidden sm:flex items-center justify-between w-full">
            <span className="text-zinc-500">qr code</span>
            <Star className="w-4 h-4 fill-zinc-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-zinc-950 flex flex-col gap-1"
        >
          <p>this is a premium feature.</p>
          <Link
            href="/pricing"
            className="text-lime-500 hover:text-lime-500/80"
          >
            learn more
          </Link>
        </TooltipContent>
      </Tooltip>

      {/* AlertDialog para mobile */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className="flex sm:hidden items-center justify-between w-full">
            <span className="text-zinc-500">qr code</span>
            <Star className="w-4 h-4 fill-zinc-500" />
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-zinc-900 flex flex-col gap-1">
          <AlertDialogTitle></AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            this is a premium feature.
            <Link
              href="/pricing"
              className="text-lime-500 hover:text-lime-500/80"
            >
              learn more
            </Link>
          </AlertDialogDescription>
          <AlertDialogFooter className="flex md:flex-row flex-col w-full">
            <AlertDialogTrigger asChild>
              <Button className="mt-5 w-fit hover:text-zinc-700 text-zinc-800 hover:bg-zinc-200/80 bg-zinc-100 cursor-pointer mx-auto">
                Close
              </Button>
            </AlertDialogTrigger>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
