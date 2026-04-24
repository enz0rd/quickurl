import React from "react";
import { BugFoundDialog } from "@/components/BugFoundDialog"
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

export default function FooterInfo() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-1 items-center">
      <small className="text-wrap text-zinc-400">
        © {new Date().getFullYear()} <Logo type="dark" bg={false} /> quickurl. All rights reserved.
      </small>
      <BugFoundDialog />
      <small className="text-wrap text-zinc-400">v0.0.11</small>
    </motion.div>
  );
}
