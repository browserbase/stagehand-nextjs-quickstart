"use server";

import { browserConfig } from "@/stagehand.config";

export async function getConfig() {
  return {
    env: browserConfig.env,
    hasBrowserbaseCredentials: Boolean(
      browserConfig.apiKey && browserConfig.projectId
    ),
    hasLLMCredentials: Boolean(process.env.BROWSERBASE_API_KEY),
  };
}
