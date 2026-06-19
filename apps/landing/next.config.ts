import type { NextConfig } from "next";

// Next Env
import { loadEnvConfig } from "@next/env";
import path from "node:path";

loadEnvConfig(path.resolve(__dirname, "../.."), undefined, undefined, true);

const nextConfig: NextConfig = {
  transpilePackages: ["@dtm/db"],
  sassOptions: {
    loadPaths: [path.join(__dirname, "src")],
  },
};

export default nextConfig;
