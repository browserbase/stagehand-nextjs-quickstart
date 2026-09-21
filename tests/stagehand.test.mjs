import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as zod from 'zod/v4';

function load(file, mocks) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => mocks[name], TextEncoder, ReadableStream, Response, Error, console: { log() {}, error() {}, warn() {} } });
  return exports;
}

for (const failure of [null, 'launch', 'debug', 'init', 'main', 'stagehand-close', 'browser-close']) {
  test(`stream and cleanup: ${failure || 'success'}`, async () => {
    const calls = [];
    const step = async (name, value) => {
      calls.push(name);
      if (failure === name) throw new Error(name);
      return value;
    };
    const browser = { sessionId: 'session', close: () => step('browser-close') };
    const route = load('app/api/stagehand/route.ts', {
      '@/stagehand.config': { __esModule: true, default: {}, browserConfig: { env: 'BROWSERBASE', apiKey: 'test' } },
      '@browserbasehq/sdk': class { sessions = { debug: () => step('debug', { debuggerFullscreenUrl: 'https://example.com' }) }; },
      '@browserbasehq/stagehand': { browserbase: { launch: () => step('launch', browser) }, Stagehand: { create: () => step('init', { close: () => step('stagehand-close') }) } },
      './main': { main: () => step('main') },
    });
    const response = await route.POST(new Request('http://localhost', { method: 'POST' }));
    const events = (await response.text()).trim().split('\n').map(JSON.parse);
    assert.equal(events.at(-1).type, failure ? 'error' : 'complete');
    if (failure !== 'launch') assert.equal(calls.filter(x => x === 'browser-close').length, 1);
    if (![ 'launch', 'debug', 'init' ].includes(failure)) assert(calls.includes('stagehand-close'));
    if (!failure) assert.equal(events[0].type, 'session');
  });
}

test('disconnect during launch closes the late browser without running the demo', async () => {
  const controller = new AbortController();
  let release;
  const launched = new Promise(resolve => { release = resolve; });
  let closed = false;
  let ran = false;
  const route = load('app/api/stagehand/route.ts', {
    '@/stagehand.config': { __esModule: true, default: {}, browserConfig: { env: 'BROWSERBASE' } },
    '@browserbasehq/stagehand': { browserbase: { launch: () => launched } },
    './main': { main: () => { ran = true; } },
  });
  await route.POST(new Request('http://localhost', { signal: controller.signal }));
  controller.abort();
  release({ close: async () => { closed = true; } });
  await new Promise(resolve => setImmediate(resolve));
  assert(closed);
  assert.equal(ran, false);
});

for (const scenario of ['locator', 'fallback', 'failed-action', 'new-page']) {
  test(`demo: ${scenario}`, async () => {
    let clicked = false;
    let acted = false;
    let created = false;
    const page = { goto: async () => {}, locator: () => ({ click: async () => {
      clicked = true;
      if (scenario === 'fallback' || scenario === 'failed-action') throw new Error('locator failed');
    } }) };
    const { main } = load('app/api/stagehand/main.ts', { 'zod/v4': zod });
    const run = main({ stagehand: {
      browser: { context: { pages: async () => scenario === 'new-page' ? [] : [page], newPage: async () => { created = true; return page; } } },
      extract: async () => ({ data: { title: 'Quickstart', link: '/quickstart', description: 'Start' } }),
      observe: async () => ({ data: [{ selector: 'a', description: 'Quickstart' }] }),
      act: async () => { acted = true; return { data: { success: scenario !== 'failed-action', message: 'Action result' } }; },
    } });
    if (scenario === 'failed-action') await assert.rejects(run, /Action result/);
    else await run;
    assert(clicked);
    assert.equal(acted, scenario === 'fallback' || scenario === 'failed-action');
    assert.equal(created, scenario === 'new-page');
  });
}

test('cancelling the response interrupts an active browser run', async () => {
  let rejectRun;
  let started;
  const running = new Promise(resolve => { started = resolve; });
  let closed = 0;
  let stagehandClosed = false;
  const browser = { close: async () => { closed++; rejectRun(new Error('Browser closed')); } };
  const route = load('app/api/stagehand/route.ts', {
    '@/stagehand.config': { __esModule: true, default: {}, browserConfig: { env: 'LOCAL' } },
    '@browserbasehq/stagehand': {
      localBrowser: { launch: async () => browser },
      Stagehand: { create: async () => ({ close: async () => { stagehandClosed = true; } }) },
    },
    './main': { main: () => new Promise((_, reject) => { rejectRun = reject; started(); }) },
  });
  const response = await route.POST(new Request('http://localhost'));
  await running;
  await response.body.cancel();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(closed, 1);
  assert(stagehandClosed);
});
