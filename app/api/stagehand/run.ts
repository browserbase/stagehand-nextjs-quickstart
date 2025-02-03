/**
 * This is the server-side entry point for Stagehand/Browserbase.
 */

"use server";

import StagehandConfig from "@/stagehand.config";
import Browserbase from "@browserbasehq/sdk";
import { ObserveResult, Page, Stagehand } from "@browserbasehq/stagehand";
import { main } from "./main";

export async function runStagehand(sessionId?: string) {
  const stagehand = new Stagehand({
    ...StagehandConfig,
    browserbaseSessionID: sessionId,
  });
  await stagehand.init();
  await main({ page: stagehand.page, context: stagehand.context, stagehand });
  await stagehand.close();
}

export async function startBBSSession() {
  const browserbase = new Browserbase();
  const session = await browserbase.sessions.create({
    projectId: StagehandConfig.projectId!,
    keepAlive: true,
  });
  const debugUrl = await browserbase.sessions.debug(session.id);
  return {
    sessionId: session.id,
    debugUrl: debugUrl.debuggerFullscreenUrl,
  };
}

export async function stopBBSSession(sessionId: string) {
  console.log("Stopping session", sessionId);
  const browserbase = new Browserbase();
  await browserbase.sessions.update(sessionId, {
    projectId: StagehandConfig.projectId!,
    status: "REQUEST_RELEASE",
  });
}

export async function getConfig() {
  const hasBrowserbaseCredentials =
    process.env.BROWSERBASE_API_KEY !== undefined &&
    process.env.BROWSERBASE_PROJECT_ID !== undefined;

  const hasLLMCredentials = process.env.OPENAI_API_KEY !== undefined;

  return {
    env: StagehandConfig.env,
    debugDom: StagehandConfig.debugDom,
    headless: StagehandConfig.headless,
    domSettleTimeoutMs: StagehandConfig.domSettleTimeoutMs,
    browserbaseSessionID: StagehandConfig.browserbaseSessionID,
    hasBrowserbaseCredentials,
    hasLLMCredentials,
  };
}

async function drawObserveOverlay(page: Page, xpath: string) {
  await page.evaluate((selector) => {
    let element;
    if (selector.startsWith("xpath=")) {
      const xpath = selector.substring(6);
      element = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
    } else {
      element = document.querySelector(selector);
    }
    if (element instanceof HTMLElement) {
      // Create overlay
      const overlay = document.createElement("div");
      // Add stagehandObserve attribute
      overlay.setAttribute("stagehandObserve", "true");
      const rect = element.getBoundingClientRect();
      overlay.style.position = "absolute";
      overlay.style.left = rect.left + "px";
      overlay.style.top = rect.top + "px";
      overlay.style.width = rect.width + "px";
      overlay.style.height = rect.height + "px";
      overlay.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "10000";
      document.body.appendChild(overlay);
    }
  }, xpath);
}

export async function goto(url: string, sessionId?: string) {
  const stagehand = new Stagehand({
    ...StagehandConfig,
    browserbaseSessionID: sessionId,
  });
  await stagehand.init();
  await stagehand.page.goto(url);
  await stagehand.close();
}

export async function observe(instruction: string, sessionId?: string) {
  const stagehand = new Stagehand({
    ...StagehandConfig,
    browserbaseSessionID: sessionId,
  });
  await stagehand.init();
  const results = await stagehand.page.observe({
    instruction,
    onlyVisible: false,
    returnAction: true,
  });
  await Promise.all(
    results.map(
      async (result) =>
        await drawObserveOverlay(stagehand.page, result.selector)
    )
  );
  await stagehand.close();
  return results;
}

export async function getSuggestions(instruction?: string, sessionId?: string) {
  const suggestions = await observe(
    "Get me the top 3 things that a user would want to do or read on this page, with the most likely first. Phrase the suggestions as ACTIONS, rather than as selectors. " +
      (instruction
        ? ` You want to achieve the following goal: "${instruction}"`
        : ""),
    sessionId!
  );
  console.log("SUGGESTIONS", suggestions);
  return suggestions;
}

export async function actFromObserve(
  observeResult: ObserveResult,
  sessionId: string
) {
  const stagehand = new Stagehand({
    ...StagehandConfig,
    browserbaseSessionID: sessionId,
  });
  await stagehand.init();
  await stagehand.page.act(observeResult);
  await stagehand.close();
}
