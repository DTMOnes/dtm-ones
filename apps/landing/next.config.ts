import type { NextConfig } from "next";

// Next Env
import { loadEnvConfig } from "@next/env";
import path from "node:path";

loadEnvConfig(path.resolve(__dirname, "../.."), undefined, undefined, true);

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: [path.join(__dirname, "src")],
    includePaths: [path.join(__dirname, "src")],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.insforge.app",
        pathname: "/api/storage/**",
      },
    ],
  },
};

export default nextConfig;
