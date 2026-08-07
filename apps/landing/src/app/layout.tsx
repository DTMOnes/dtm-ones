import type { Metadata } from "next";
import { Big_Shoulders, Inter } from "next/font/google";
import "./globals.css";

// Queries
import { listPublicRosterCategories } from "@/lib/roster/queries";

// Components
import NavigationProgress from "@/components/NavigationProgress";
import { HeaderProvider } from "@/components/Header/HeaderProvider";
import SiteHeader from "@/components/Header/SiteHeader";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await listPublicRosterCategories();

  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${inter.variable} dark`}
    >
      <body className="antialiased font-inter">
        <NavigationProgress />
        <HeaderProvider>
          <SiteHeader categories={categories} />
          {children}
        </HeaderProvider>
      </body>
    </html>
  );
}
