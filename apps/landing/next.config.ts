import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(path.resolve(__dirname, "../.."));

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: [path.join(__dirname, "src")],
  },
};

export default nextConfig;
