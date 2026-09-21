import type { StagehandCreateOptions } from "@browserbasehq/stagehand";
import dotenv from "dotenv";

dotenv.config();

// Browser creation is separate from Stagehand configuration in v4.
export const browserConfig = {
  env: "BROWSERBASE" as "BROWSERBASE" | "LOCAL",
  apiKey: process.env.BROWSERBASE_API_KEY,
  projectId: process.env.BROWSERBASE_PROJECT_ID,
};

const StagehandConfig = {
  // Model Gateway selects a model using your Browserbase credentials.
  apiKey: process.env.BROWSERBASE_API_KEY,
  domSettleTimeoutMs: 30_000,
  logging: { level: "info", format: "pretty" },
} satisfies Omit<StagehandCreateOptions, "browser">;

export default StagehandConfig;
