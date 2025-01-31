"use client";

export default function DebuggerIframe({
  debugUrl,
  env,
}: {
  debugUrl?: string;
  env: "BROWSERBASE" | "LOCAL";
}) {
  if (!debugUrl && env === "LOCAL") {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden text-wrap border border-gray-200">
        <span className="text-black p-8 max-w-full whitespace-normal break-words">
          Running in local mode.
          <br />
          Set{" "}
          <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
            env: &quot;BROWSERBASE&quot;
          </code>
          in{" "}
          <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
            stagehand.config.ts
          </code>{" "}
          to see a live embedded browser.
        </span>
      </div>
    );
  }

  if (!debugUrl) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden text-wrap">
        <span className="text-black p-8 max-w-full whitespace-normal break-words">
          Loading...
        </span>
      </div>
    );
  }

  return <iframe src={debugUrl} className="h-full w-full aspect-video border border-gray-200 dark:border-gray-800 " />;
}
