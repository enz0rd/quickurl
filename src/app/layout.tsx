import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "QuickURL",
  description: "QuickURL is a URL shortening service that allows you to create short URLs for your links.",
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
        className={`${poppins.variable} bg-zinc-900 text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
