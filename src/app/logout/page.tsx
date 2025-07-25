"use client";
import React from "react";

export default function Page() {
    React.useEffect(() => {
        // Clear the token from localStorage on logout
        localStorage.removeItem("token");
        localStorage.removeItem("userPlan");
        window.location.href = "/login"; // Redirect to login page
    }, []);

    return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-4xl font-bold">loggin out</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            see you soon! you have been logged out successfully.
          </p>
        </div>
      </main>
    </div>
  );
}
