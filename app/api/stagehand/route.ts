import StagehandConfig, { browserConfig } from "@/stagehand.config";
import Browserbase from "@browserbasehq/sdk";
import {
  browserbase,
  localBrowser,
  Stagehand,
  type StagehandBrowser,
} from "@browserbasehq/stagehand";
import { main } from "./main";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const encoder = new TextEncoder();
  let cancelled = request.signal.aborted;
  let browser: StagehandBrowser | undefined;
  let browserClosing: Promise<void> | undefined;
  const closeBrowser = () => {
    if (browser) browserClosing ??= browser.close();
    return browserClosing;
  };
  const cancel = () => {
    cancelled = true;
    void closeBrowser()?.catch((error) => console.error("Browser cleanup failed:", error));
  };
  const stream = new ReadableStream({
    start(controller) {
      // Return immediately so stream cancellation can interrupt an active run.
      void (async () => {
        const send = (event: object) => {
          if (!cancelled) controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        };
        request.signal.addEventListener("abort", cancel, { once: true });
        let stagehand: Stagehand | undefined;
        let failure: unknown;
        let failed = false;
        try {
          if (cancelled) return;
          browser = browserConfig.env === "BROWSERBASE"
            ? await browserbase.launch({
                apiKey: browserConfig.apiKey!,
                projectId: browserConfig.projectId,
              })
            : await localBrowser.launch({ headless: false });
          if (cancelled) return;
          if (browser.sessionId) {
            const client = new Browserbase({ apiKey: browserConfig.apiKey });
            const debug = await client.sessions.debug(browser.sessionId);
            send({ type: "session", sessionId: browser.sessionId, debugUrl: debug.debuggerFullscreenUrl });
          }
          if (cancelled) return;
          stagehand = await Stagehand.create({ browser, ...StagehandConfig });
          if (cancelled) return;
          await main({ stagehand });
        } catch (error) {
          failed = true;
          failure = error;
          console.error("Stagehand run failed:", error);
        } finally {
          try {
            await stagehand?.close();
          } catch (error) {
            failed = true;
            failure ??= error;
            console.error("Stagehand cleanup failed:", error);
          }
          try {
            await closeBrowser();
          } catch (error) {
            failed = true;
            failure ??= error;
            console.error("Browser cleanup failed:", error);
          }
          request.signal.removeEventListener("abort", cancel);
          if (!cancelled) {
            send(failed
              ? { type: "error", message: failure instanceof Error ? failure.message : "Stagehand run failed" }
              : { type: "complete" });
            controller.close();
          }
        }
      })();
    },
    cancel,
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" },
  });
}
