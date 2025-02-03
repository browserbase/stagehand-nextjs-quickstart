"use client";

import { getConfig } from "@/app/api/stagehand/run";
import {
  debugUrlAtom,
  errorAtom,
  runningAtom,
  sessionIdAtom,
  warningAtom,
} from "@/atoms";
import ErrorOrWarning from "@/components/client/Error";
import Start from "@/components/client/Start";
import DebuggerIframe from "@/components/stagehand/debuggerIframe";
import { ConstructorParams } from "@browserbasehq/stagehand";
import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [config, setConfig] = useState<ConstructorParams | null>(null);
  const sessionId = useAtomValue(sessionIdAtom);
  const debugUrl = useAtomValue(debugUrlAtom);
  const error = useAtomValue(errorAtom);
  const [warning, setWarning] = useAtom(warningAtom);
  const running = useAtomValue(runningAtom);

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
  }, [setWarning]);

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
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 font-semibold">
              api/stagehand/main.ts
            </code>
            .
          </li>
        </ul>

        <Start sessionId={sessionId} />
        <ErrorOrWarning error={error} warning={warning} />
      </main>
    </div>
  );
}
