import type { V3Options, LogLine } from "@browserbasehq/stagehand";
import dotenv from "dotenv";

dotenv.config();

const StagehandConfig: V3Options = {
  env: "BROWSERBASE" /* Environment: "LOCAL" or "BROWSERBASE" */,
  verbose: 2 /* Logging verbosity: 0 (minimal), 1 (default), or 2 (detailed) */,
  apiKey: process.env.BROWSERBASE_API_KEY /* API key for authentication */,
  projectId: process.env.BROWSERBASE_PROJECT_ID /* Project identifier */,
  browserbaseSessionID:
    undefined /* Session ID for resuming Browserbase sessions */,
  browserbaseSessionCreateParams: {
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
  } /* Parameters for creating Browserbase sessions */,
  localBrowserLaunchOptions: {
    headless: false,
  } /* Options for local browser launch (headless, args, etc.) */,
  model: {
    modelName: "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY,
  } /* Model configuration: can be string or object with modelName and apiKey */,
  llmClient: undefined /* Optional: custom LLM client implementation */,
  systemPrompt: undefined /* Optional: system prompt for model */,
  logger: (message: LogLine) =>
    console.log(logLineToString(message)) /* Custom logging function */,
  domSettleTimeout: 30_000 /* Timeout for DOM to settle in milliseconds */,
  selfHeal: undefined /* Enable self-healing for failed actions */,
  logInferenceToFile: false /* Log inference calls to file */,
  experimental: false /* Enable experimental features */,
  disablePino: false /* Disable pino logging backend */,
  disableAPI: false /* Disable API functionality */,
  cacheDir: undefined /* Directory for caching actions (enables caching when set) */,
};
export default StagehandConfig;

/**
 * Custom logging function that you can use to filter logs.
 *
 * General pattern here is that `message` will always be unique with no params
 * Any param you would put in a log is in `auxiliary`.
 *
 * For example, an error log looks like this:
 *
 * ```
 * {
 *   category: "error",
 *   message: "Some specific error occurred",
 *   auxiliary: {
 *     message: { value: "Error message", type: "string" },
 *     trace: { value: "Error trace", type: "string" }
 *   }
 * }
 * ```
 *
 * You can then use `logLineToString` to filter for a specific log pattern like
 *
 * ```
 * if (logLine.message === "Some specific error occurred") {
 *   console.log(logLineToString(logLine));
 * }
 * ```
 */
export function logLineToString(logLine: LogLine): string {
  // If you want more detail, set this to false. However, this will make the logs
  // more verbose and harder to read.
  const HIDE_AUXILIARY = true;

  try {
    const timestamp = logLine.timestamp || new Date().toISOString();
    if (logLine.auxiliary?.error) {
      return `${timestamp}::[stagehand:${logLine.category}] ${logLine.message}\n ${logLine.auxiliary.error.value}\n ${logLine.auxiliary.trace.value}`;
    }

    // If we want to hide auxiliary information, we don't add it to the log
    return `${timestamp}::[stagehand:${logLine.category}] ${logLine.message} ${
      logLine.auxiliary && !HIDE_AUXILIARY
        ? JSON.stringify(logLine.auxiliary)
        : ""
    }`;
  } catch (error) {
    console.error(`Error logging line:`, error);
    return "error logging line";
  }
}
