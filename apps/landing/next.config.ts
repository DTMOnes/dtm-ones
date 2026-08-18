import type { NextConfig } from "next";

// Next Env
import { loadEnvConfig } from "@next/env";
import path from "node:path";

loadEnvConfig(path.resolve(__dirname, "../.."), undefined, undefined, true);

const nextConfig: NextConfig = {
  transpilePackages: ["@dtm/database"],
  sassOptions: {
    loadPaths: [path.join(__dirname, "src")],
    includePaths: [path.join(__dirname, "src")],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
};

export default nextConfig;
