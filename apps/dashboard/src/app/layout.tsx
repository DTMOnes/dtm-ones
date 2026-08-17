import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "DTM ONES Dashboard",
  description: "DTM ONES Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
