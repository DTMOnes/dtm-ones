import type { Metadata } from "next";
import { Anton, Montserrat } from "next/font/google";
import "./globals.css";

// Components
import NavigationProgress from "@/components/NavigationProgress";
import SiteHeader from "@/components/Header/SiteHeader";
import Footer from "@/components/Footer";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "DTMones",
  description:
    "Basketball talent agency built on 25 years of trust. Connecting players and coaches with opportunities worldwide.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${montserrat.variable} group/chrome dark font-sans`}
    >
      <body className="antialiased">
        <NavigationProgress />
        <SiteHeader />
        <div className="page-scroll">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
