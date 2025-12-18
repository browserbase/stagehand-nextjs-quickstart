/**
 * 🤘 Welcome to Stagehand!
 *
 *
 * To edit config, see `stagehand.config.ts`
 *
 * In this quickstart, we'll be automating a browser session to show you the power of Stagehand.
 *
 * 1. Go to https://docs.browserbase.com/
 * 2. Use `extract` to find information about the quickstart
 * 3. Use `observe` to find the links under the 'Guides' section
 * 4. Use Playwright to click the first link. If it fails, use `act` to gracefully fallback to Stagehand.
 */

import { Stagehand } from "@browserbasehq/stagehand";
import { chromium } from "playwright-core";
import { z } from "zod/v3";

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
      `📍 Step 1: Stagehand will auto-navigate to "https://docs.browserbase.com/"`,
      `📍 Step 2: Stagehand will use AI to "extract" information about the quickstart`,
      `📍 Step 3: Stagehand will use AI to "observe" and identify links in the 'Guides' section`,
      `📍 Step 4: Stagehand will attempt to click the first link using Playwright, with "act" as an AI fallback`,
    ].join("\n")
  );

  const page = stagehand.context.pages()[0];
  await page.goto("https://docs.browserbase.com/");

  // You can also attach Stagehand to Playwright and use those primitives directly
  const browser = await chromium.connectOverCDP({
    wsEndpoint: stagehand.connectURL(),
  });
  
  const pwContext = browser.contexts()[0];
  const pwPage = pwContext.pages()[0];

  // Zod is a schema validation library similar to Pydantic in Python
  // For more information on Zod, visit: https://zod.dev/
  const description = await stagehand.extract(
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

  const observeResult = await stagehand.observe(
    "Find the links under the 'Guides' section",
  );
  announce(
    `Observe: We can click:\n${observeResult
      .map((r) => `"${r.description}" -> ${r.selector}`)
      .join("\n")}`,
    "Observe"
  );

  try {
    throw new Error(
      "Comment out this error to run the base Playwright code!"
    );

    // Wait for search button and click it
    const quickStartSelector = `#content-area > div.relative.mt-8.prose.prose-gray.dark\:prose-invert > div > a:nth-child(1)`;
    await pwPage.waitForSelector(quickStartSelector);
    await pwPage.locator(quickStartSelector).click();
    await pwPage.waitForLoadState("networkidle");
    announce(
      `Clicked the quickstart link using base Playwright code. Uncomment line 118 in index.ts to have Stagehand take over!`
    );
  } catch (e) {
    if (!(e instanceof Error)) {
      throw e;
    }

    const actResult = await stagehand.act(
      "Click the link to the quickstart",
    );
    announce(
      `Clicked the quickstart link using Stagehand AI fallback.` +
        `\n${actResult}`,
      "Act"
    );
  }

  console.log(
    [
      "To recap, here are the steps we took:",
      `1. We went to https://docs.browserbase.com/`,
      `---`,
      `2. We used extract to find information about the quickstart`,
      `The ${description.title} is at: ${description.link}` +
        `\n\n${description.description}` +
        `\n\n${JSON.stringify(description, null, 2)}`,
      `---`,
      `3. We used observe to find the links under the 'Guides' section and got the following results:`,
      `We could have clicked:\n\n${observeResult
        .map((r) => `"${r.description}" -> ${r.selector}`)
        .join("\n")}`,
      `---`,
      `4. We used Playwright to click the first link. If it failed, we used act to gracefully fallback to Stagehand.`,
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
