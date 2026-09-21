import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // v4 uploads this browser extension when creating a Browserbase session.
  outputFileTracingIncludes: {
    "/api/stagehand": [
      "./node_modules/@browserbasehq/stagehand/dist/assets/stagehand-extension.zip",
    ],
  },
  serverExternalPackages: [
    "@browserbasehq/stagehand",
    "@browserbasehq/sdk",
  ],
};

export default nextConfig;
