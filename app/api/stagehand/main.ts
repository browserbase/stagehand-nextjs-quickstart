/**
 * 🤘 Welcome to Stagehand!
 *
 *
 * To edit config, see `stagehand.config.ts`
 *
 * In this quickstart, we'll be automating a browser session to show you the power of Stagehand.
 *
 * 1. Go to https://docs.stagehand.dev/
 * 2. Use `extract` to find information about the quickstart
 * 3. Use `observe` to find the quickstart link
 * 4. Use Stagehand browser APIs to click the first link. If it fails, use `act` to gracefully fallback to Stagehand.
 */

import type { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod/v4";

export async function main({
  stagehand,
}: {
  stagehand: Stagehand; // Stagehand instance
}) {
  console.log(
    [
      `🤘 "Welcome to Stagehand!"`,
      "",
      "Stagehand is a tool that allows you to automate browser interactions.",
      "Watch as this demo automatically performs the following steps:",
      "",
      `📍 Step 1: Stagehand will auto-navigate to "https://docs.stagehand.dev/"`,
      `📍 Step 2: Stagehand will use AI to "extract" information about the quickstart`,
      `📍 Step 3: Stagehand will use AI to "observe" and identify quickstart link`,
      `📍 Step 4: Stagehand will attempt to click the first link using browser locators, with "act" as an AI fallback`,
    ].join("\n")
  );

  const [existingPage] = await stagehand.browser.context.pages();
  const page = existingPage ?? await stagehand.browser.context.newPage();
  await page.goto("https://docs.stagehand.dev/");

  // Zod is a schema validation library similar to Pydantic in Python
  // For more information on Zod, visit: https://zod.dev/
  const { data: description } = await stagehand.extract(
    "extract the title, description, and link of the quickstart",
    z.object({
      title: z.string(),
      link: z.string(),
      description: z.string(),
    })
  );
  announce(
    `The ${description.title} is at: ${description.link}` +
      `\n\n${description.description}` +
      `\n\n${JSON.stringify(description, null, 2)}`,
    "Extract"
  );

  const { data: observeResult } = await stagehand.observe(
    "Find the quickstart link",
  );
  announce(
    `Observe: We can click:\n${observeResult
      .map((r) => `"${r.description}" -> ${r.selector}`)
      .join("\n")}`,
    "Observe"
  );

  try {
    const quickstartAction = observeResult[0];
    if (!quickstartAction) throw new Error("No quickstart link found");
    await page.locator(quickstartAction.selector).click();
    announce("Clicked the quickstart link using a browser locator.");
  } catch (e) {
    console.warn("Locator click failed; trying the AI fallback:", e instanceof Error ? e.message : e);
    if (!(e instanceof Error)) {
      throw e;
    }

    const { data: actResult } = await stagehand.act(
      "Click the link to the quickstart",
    );
    if (!actResult.success) throw new Error(actResult.message || "Unable to click the quickstart link");
    announce(
      `Clicked the quickstart link using Stagehand AI fallback.` +
        `\n${actResult.message}`,
      "Act"
    );
  }

  console.log(
    [
      "To recap, here are the steps we took:",
      `1. We went to https://docs.stagehand.dev/`,
      `---`,
      `2. We used extract to find information about the quickstart`,
      `The ${description.title} is at: ${description.link}` +
        `\n\n${description.description}` +
        `\n\n${JSON.stringify(description, null, 2)}`,
      `---`,
      `3. We used observe to find the quickstart link and got the following results:`,
      `We could have clicked:\n\n${observeResult
        .map((r) => `"${r.description}" -> ${r.selector}`)
        .join("\n")}`,
      `---`,
      `4. We used browser locators to click the first link. If it failed, we used act to gracefully fallback to Stagehand.`,
    ].join("\n\n")
  );
}

function announce(message: string, title?: string) {
  console.log({
    padding: 1,
    margin: 3,
    title: title || "Stagehand",
    message: message,
  });
}
