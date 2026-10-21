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

const siteDescription =
  "Basketball talent agency built on 25 years of trust. Connecting players and coaches with opportunities worldwide.";

// Link previews (og-image.png) when a page is shared on social apps or chats.
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  ),
  title: "DTMones",
  description: siteDescription,
  openGraph: {
    title: "DTMones",
    description: siteDescription,
    siteName: "DTMones",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DTMones" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DTMones",
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
