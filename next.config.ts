import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@browserbasehq/stagehand",
    "@browserbasehq/sdk",
    "thread-stream",
    "pino",
    "pino-pretty",
  ],
};

export default nextConfig;
