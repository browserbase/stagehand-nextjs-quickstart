# 🤘 Welcome to Stagehand Next.js!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbrowserbase%2Fstagehand-nextjs-quickstart&env=BROWSERBASE_API_KEY,BROWSERBASE_PROJECT_ID,OPENAI_API_KEY&envDescription=Browserbase%20credentials%20%2B%20OpenAI.%20You%20can%20configure%20your%20project%20to%20use%20Anthropic%20or%20a%20custom%20LLMClient%20in%20stagehand.config.ts&project-name=stagehand-nextjs&repository-name=stagehand-nextjs)

Hey! This is a Next.js project built with [Stagehand](https://github.com/browserbase/stagehand).

You can build your own web agent using: `npx create-browser-app`!

## Setting the Stage

Stagehand is an SDK for automating browsers. It's built on top of [Playwright](https://playwright.dev/) and provides a higher-level API for better debugging and AI fail-safes.

## Curtain Call

Get ready for a show-stopping development experience. Just run:

```bash
npm install && npm run dev
```

## What's Next?

### Add your API keys

This project defaults to using OpenAI, so it's going to throw a fit if you don't have an OpenAI API key.

To use Anthropic (or other LLMs), you'll need to edit [stagehand.config.ts](stagehand.config.ts) to use the appropriate API key.

You'll also want to set your Browserbase API key and project ID to run this project in the cloud.

```bash
cp .example.env .env # Add your API keys to .env
```

### Custom .cursorrules

We have custom .cursorrules for this project. It'll help quite a bit with writing Stagehand easily.

### Run on Browserbase

To run on Browserbase, add your API keys to .env and change `env: "LOCAL"` to `env: "BROWSERBASE"` in [stagehand.config.ts](stagehand.config.ts).

### Use Anthropic Claude 3.5 Sonnet

1. Add your API key to .env
2. Change `modelName: "gpt-4o"` to `modelName: "claude-3-5-sonnet-latest"` in [stagehand.config.ts](stagehand.config.ts)
3. Change `modelClientOptions: { apiKey: process.env.OPENAI_API_KEY }` to `modelClientOptions: { apiKey: process.env.ANTHROPIC_API_KEY }` in [stagehand.config.ts](stagehand.config.ts)
