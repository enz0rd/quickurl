import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Header() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setHasToken(true);
    }
  }, [hasToken]);

  return (
    <div className="flex w-full gap-2 justify-end">
      {hasToken ? (
        <>
          <Link
            href="/dashboard"
            className="text-white bg-zinc-950 px-3 py-1 rounded-full"
          >
            dashboard
          </Link>
          <Link
            href="/logout"
            className="text-white bg-zinc-950 px-3 py-1 rounded-full"
          >
            logout
          </Link>
        </>
      ) : (
        <Link
          href="/login"
          className="text-white bg-zinc-950 px-3 py-1 rounded-full"
        >
          login
        </Link>
      )}
    </div>
  );
}
