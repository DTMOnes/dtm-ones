import type { Metadata } from "next";
import { Anton, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "DTM Ones — The Name Talent Trusts",
  description:
    "Basketball talent agency built on 25 years of trust. Connecting players and coaches with opportunities worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${poppins.variable} dark`}>
      <body className="antialiased font-poppins">{children}</body>
    </html>
  );
}
