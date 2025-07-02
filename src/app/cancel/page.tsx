import FooterInfo from "@/components/FooterInfo";
import Header from "../header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center m-auto">
          <h1 className="text-4xl font-bold text-center">
            maybe next time!
          </h1>
          <p className="text-gray-500 text-md mx-2 text-wrap text-center">
            you cancelled your checkout successfully, if you have any questions, please contact us
            through our <a href="https://github.com/enz0rd/quickurl" target="_blank" className="text-lime-500 decoration-none underline">github</a> or <a href="mailto:enzorossidaltoe@hotmail.com.br" target="_blank" className="text-lime-500 decoration-none underline">email</a>
          </p>
          <p className="text-gray-500 text-md mx-2 text-wrap text-center text-lime-500">
            you can always come back and subscribe later!
          </p>
          <p className="text-gray-500 text-md mx-2 text-wrap text-center">feel free to use the free version of quickurl, it has all the basic features you need to manage your links.</p>
        </div>
      </main>
      <Link href="/" className="flex flex-row gap-2 items-center">
          <ArrowLeft className="w-4 h-4" />
          <p>back to home</p>
        </Link>
      <FooterInfo />
    </div>
  );
};