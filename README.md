# 🤘 Welcome to Stagehand Next.js!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbrowserbase%2Fstagehand-nextjs-quickstart&env=BROWSERBASE_API_KEY,BROWSERBASE_PROJECT_ID&envDescription=Browserbase%20credentials%20for%20browser%20sessions%20and%20Model%20Gateway&project-name=stagehand-nextjs&repository-name=stagehand-nextjs)

Hey! This is a Next.js project built with [Stagehand](https://github.com/browserbase/stagehand).

You can build your own web agent using: `npx create-browser-app`!

## Setting the Stage

Stagehand is an SDK for automating browsers. This quickstart uses Stagehand 4.1.0, with browser creation through `browserbase.launch()` or `localBrowser.launch()` and AI operations through `Stagehand.create()`.

## Curtain Call

Get ready for a show-stopping development experience. Just run:

```bash
pnpm install && pnpm dev
```

## What's Next?

### Add your API keys

This project uses Browserbase Model Gateway. Set `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID`; no separate OpenAI key is required.

```bash
cp .example.env .env # Add your API keys to .env
```

### Custom .cursorrules

We have custom .cursorrules for this project. It'll help quite a bit with writing Stagehand easily.

### Run on Browserbase

To run on Browserbase, add your API keys to .env and set `browserConfig.env` to `"BROWSERBASE"` in [stagehand.config.ts](stagehand.config.ts).

### Choose a model

By default, Model Gateway chooses the model. To select one explicitly, add a `model` object with a supported provider-prefixed `modelName` to `stagehand.config.ts`. Model Gateway uses your Browserbase API key.

### Live demo lifecycle

The `/api/stagehand` POST route streams the session ID and debugger URL to the page while the demo runs. It creates the browser with the Stagehand v4 extension, uses Zod v4 schemas and the `data` returned by `extract()` and `observe()`, and closes both Stagehand and the browser when finished or when a run fails.

### Validation

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`. The regression tests mock Browserbase and cover locator fallback, failed actions, session streaming, and browser cleanup, including client disconnection. A live run additionally requires the API keys above.

The demo navigates to `https://docs.stagehand.dev/` to extract and follow its quickstart link. The previous `docs.browserbase.com` target did not expose the Stagehand v4 extension context during live verification, causing locator and AI clicks to fail.
