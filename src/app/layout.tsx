import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import LiquidEther from "@/components/LiquidEther";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "QuickURL",
  description:
    "QuickURL is a URL shortening service that allows you to create short URLs for your links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/logo/svg/quickurl_icon_bg.svg" />
      </head>
      <body
        className={`${poppins.variable} bg-zinc-950 text-white antialiased min-h-screen`}
      >
        <div className="fixed inset-0 -z-10 min-h-screen w-screen">
          <LiquidEther
            mouseForce={20}
            cursorSize={100}
            isViscous
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
            colors={["#243c00", "#4b7c01", "#86d512"]}
          />
        </div>
        {children}
      </body>
    </html>
  );
}
