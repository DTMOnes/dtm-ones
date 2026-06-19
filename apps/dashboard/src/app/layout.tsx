import type { Metadata } from "next";
import { Bebas_Neue, Figtree, Geist } from "next/font/google";
import "./globals.css";

// Shadcn
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const bebas_neue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

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
    <html
      lang="en"
      className={cn("dark", bebas_neue.variable, "font-sans", geist.variable)}
    >
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
