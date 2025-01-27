"use client";

import {
  getConfig,
  runStagehand,
  startBBSSession,
} from "@/app/api/stagehand/route";
import DebuggerIframe from "@/components/stagehand/debuggerIframe";
import { ConstructorParams } from "@browserbasehq/stagehand";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [config, setConfig] = useState<ConstructorParams | null>(null);
  const [running, setRunning] = useState(false);
  const [debugUrl, setDebugUrl] = useState<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    const config = await getConfig();
    setConfig(config);
    const warningToShow: string[] = [];
    if (!config.hasLLMCredentials) {
      warningToShow.push(
        "No LLM credentials found. Edit stagehand.config.ts to configure your LLM client."
      );
    }
    if (!config.hasBrowserbaseCredentials) {
      warningToShow.push(
        "No BROWSERBASE_API_KEY or BROWSERBASE_PROJECT_ID found. You will probably want this to run Stagehand in the cloud."
      );
    }
    setWarning(warningToShow.join("\n"));
  }, []);

  const startScript = useCallback(async () => {
    if (!config) return;

    setRunning(true);

    try {
      if (config.env === "BROWSERBASE") {
        const { sessionId, debugUrl } = await startBBSSession();
        setDebugUrl(debugUrl);
        setSessionId(sessionId);
        await runStagehand(sessionId);
      } else {
        await runStagehand();
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setRunning(false);
    }
  }, [config]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  if (config === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:block hidden"
          src="/logo_dark.svg"
          alt="Stagehand logo"
          width={180}
          height={38}
          priority
        />
        <Image
          className="block dark:hidden"
          src="/logo_light.svg"
          alt="Stagehand logo"
          width={180}
          height={38}
          priority
        />
        {running && <DebuggerIframe debugUrl={debugUrl} env={config.env} />}
        <ul className="list-inside text-xl text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              api/stagehand/main.ts
            </code>
            .
          </li>
        </ul>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {!running && (
            <a
              href="#"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 hover:bg-yellow-500"
              onClick={startScript}
            >
              🤘 Run Stagehand
            </a>
          )}
          {sessionId && (
            <a
              href={`https://www.browserbase.com/sessions/${sessionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-red-500 text-white gap-2 hover:bg-white hover:text-black text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              🅱️ View Session on Browserbase
            </a>
          )}
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://docs.stagehand.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
        {error && (
          <div className="bg-red-400 text-white rounded-md p-2 max-w-lg">
            Error: {error}
          </div>
        )}
        {warning && (
          <div className="bg-yellow-400 text-black rounded-md p-2 max-w-lg">
            <strong>Warning:</strong> {warning}
          </div>
        )}
      </main>
    </div>
  );
}
