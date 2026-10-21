import type { Metadata } from "next";
import { Anton, Montserrat } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "DTMones Dashboard",
  description: "DTMones Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", anton.variable, montserrat.variable)}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
