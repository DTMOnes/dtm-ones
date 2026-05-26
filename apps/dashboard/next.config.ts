import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(path.resolve(__dirname, "../.."));

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "utfs.io",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "*.ufs.sh",
    pathname: "/**",
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  remotePatterns.push({
    protocol: "https",
    hostname: new URL(supabaseUrl).hostname,
    pathname: "/storage/v1/object/public/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
