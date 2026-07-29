import type { Metadata } from "next";
import { Big_Shoulders, Inter } from "next/font/google";
import "./globals.css";

// Components
import Header from "@/components/Header";
import NavigationProgress from "@/components/NavigationProgress";

const bigShoulders = Big_Shoulders({
  weight: ["400", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-big-shoulders",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DTM ONES",
  description:
    "Basketball talent agency built on 25 years of trust. Connecting players and coaches with opportunities worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${inter.variable} dark`}
    >
      <body className="antialiased font-inter">
        <NavigationProgress />
        <Header />
        {children}
      </body>
    </html>
  );
}
