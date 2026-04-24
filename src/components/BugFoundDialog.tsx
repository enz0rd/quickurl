import { AlertDialog, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bug } from "lucide-react";
import BorderGlow from "./BorderGlow";

export function BugFoundDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <span className="text-zinc-300 cursor-pointer flex items-center gap-1 text-xs">found a bug? <Bug className="w-4 h-4" /></span>
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
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-200 font-bold flex flex-row gap-2 items-center justify-center"><Bug className="w-6 h-6" /><span className="text-zinc-200 font-bold">Found a bug?</span></AlertDialogTitle>
          </AlertDialogHeader>  
          <AlertDialogDescription className="text-zinc-300 my-6">
            If you found a bug, please let us know by clicking the button below and opening an issue on our github repository.
          </AlertDialogDescription>
          <AlertDialogFooter className="flex flex-row justify-between w-full">
            <AlertDialogCancel className="hover:text-zinc-300 text-zinc-200 bg-transparent hover:bg-transparent border-none cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction className="hover:text-zinc-300 text-zinc-200 bg-lime-500/60 hover:bg-lime-700/60 border-none cursor-pointer">
              <a href="https://github.com/enz0rd/quickurl/issues" target="_blank">
                Submit
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>    
        </BorderGlow>
      </AlertDialogContent>
    </AlertDialog>
  );
};