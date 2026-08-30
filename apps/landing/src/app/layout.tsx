import type { Metadata } from "next";
import { Big_Shoulders, Inter } from "next/font/google";
import "./globals.css";

// Components
import NavigationProgress from "@/components/NavigationProgress";
import { HeaderProvider } from "@/components/Header/HeaderProvider";
import SiteHeader from "@/components/Header/SiteHeader";
import Footer from "@/components/Footer";

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

const siteDescription =
  "Basketball talent agency built on 25 years of trust. Connecting players and coaches with opportunities worldwide.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  ),
  title: "DTM ONES",
  description: siteDescription,
  openGraph: {
    title: "DTM ONES",
    description: siteDescription,
    siteName: "DTM ONES",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DTM ONES",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DTM ONES",
    description: siteDescription,
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${inter.variable} group/chrome dark font-sans`}
    >
      <body className="antialiased">
        <NavigationProgress />
        <HeaderProvider>
          <SiteHeader />
          <div className="page-scroll">{children}</div>
          <Footer />
        </HeaderProvider>
      </body>
    </html>
  );
}
