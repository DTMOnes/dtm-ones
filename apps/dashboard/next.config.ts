import type { NextConfig } from "next";

// Next Env
import { loadEnvConfig } from "@next/env";
import path from "node:path";

loadEnvConfig(path.resolve(__dirname, "../.."), undefined, undefined, true);

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  transpilePackages: ["@dtm/database"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.insforge.app",
        pathname: "/api/storage/**",
      },
    ],
  },
};

export default nextConfig;
