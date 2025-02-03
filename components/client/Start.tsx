"use client";

import { goto, startBBSSession, stopBBSSession } from "@/app/api/stagehand/run";
import { debugUrlAtom, runningAtom, sessionIdAtom } from "@/atoms";
import { useAtom, useSetAtom } from "jotai";
import Image from "next/image";
import { CommandMenu } from "./Command";

export default function Start({
  sessionId,
}: {
  sessionId: string | undefined;
}) {
  const [running, setRunning] = useAtom(runningAtom);
  const setSessionId = useSetAtom(sessionIdAtom);
  const setDebugUrl = useSetAtom(debugUrlAtom);
  return (
    <div className="flex gap-4 items-center flex-col sm:flex-row">
      {!running && (
        <a
          href="#"
          className=" border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 hover:bg-yellow-500"
          onClick={async () => {
            setRunning(true);
            const { sessionId, debugUrl } = await startBBSSession();
            setSessionId(sessionId);
            setDebugUrl(debugUrl);
          }}
        >
          🤘 Run Stagehand
        </a>
      )}
      {sessionId && running && (
        <>
          <a
            href="#"
            className=" border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 hover:bg-yellow-500"
            onClick={() => {
              stopBBSSession(sessionId);
              setRunning(false);
              setSessionId(undefined);
              setDebugUrl(undefined);
            }}
          >
            🤘 Stop Session
          </a>
          <CommandMenu />

          <a
            href={`https://www.browserbase.com/sessions/${sessionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-solid transition-colors flex items-center justify-center bg-[#F9F6F4] text-black gap-2 hover:border-[#F7F7F7] hover:text-black text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 group "
          >
            <div className="relative w-4 h-4">
              <Image
                src="/browserbase_grayscale.svg"
                alt="Browserbase"
                width={16}
                height={16}
                className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <Image
                src="/browserbase.svg"
                alt="Browserbase"
                width={16}
                height={16}
                className="absolute group-hover:opacity-0 transition-opacity"
              />
            </div>
            View Session on Browserbase
          </a>
        </>
      )}

      {running && (
        <a
          className="border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          href="#"
          onClick={() => {
            goto("https://stagehand.dev", sessionId);
          }}
        >
          Goto
        </a>
      )}
      <a
        className="border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
        href="https://docs.stagehand.dev"
        target="_blank"
        rel="noopener noreferrer"
      >
        Read our docs
      </a>
    </div>
  );
}
