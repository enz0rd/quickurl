import React from "react";
import { BugFoundDialog } from "@/components/BugFoundDialog"
import { Logo } from "@/components/Logo";

export default function FooterInfo() {
  return (
    <div className="flex flex-col gap-1 items-center">
      <small className="text-wrap text-zinc-400">
        © 2025 <Logo type="dark" bg={false} /> quickurl. All rights reserved.
      </small>
      <BugFoundDialog />
      <small className="text-wrap text-zinc-400">v0.0.7</small>
    </div>
  );
}
