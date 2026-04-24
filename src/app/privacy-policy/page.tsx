"use client";
import FooterInfo from "@/components/FooterInfo";
import Header from "@/app/header";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Page() {
    const [htmlContent, setHtmlContent] = useState("");

    useEffect(() => {
        fetch('/privacyPolicy.html')
            .then((response) => response.text())
            .then((html) => {
                const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                setHtmlContent(match ? match[1] : html);
            });
    }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start container w-[300px] md:container mx-auto"
      >
        <div className="flex flex-col gap-2 items-center m-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl font-bold"
          >
            Privacy Policy
          </motion.h1>
          <div
            dangerouslySetInnerHTML={{ __html: htmlContent}}
          />
        </div>
      </motion.main>
      <FooterInfo />
    </div>
  );
}
