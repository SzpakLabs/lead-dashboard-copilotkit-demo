#!/usr/bin/env node
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import { accessSync, constants } from "node:fs";
import fs from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);

const viewports = {
  desktop: { width: 1440, height: 900, mobile: false, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, mobile: true, deviceScaleFactor: 2 }
};

const args = new Set(process.argv.slice(2));
const selectedVariant = valueArg("--variant");
const selectedBranch = valueArg("--branch");
const selectedViewport = valueArg("--viewport");
const outputDirArg = valueArg("--out");
const configArg = valueArg("--config");
const routesArg = valueArg("--routes");
const mobileModeArg = valueArg("--mobile-mode");
const keepServers = args.has("--keep-servers");
const noBuild = args.has("--no-build");
const dryRun = args.has("--dry-run");

if (args.has("--help")) {
  console.log(`Usage:
  node design-variants/capture-fullpage-screenshots.mjs [options]

Options:
  --config=FILE                   Default: design-variants/redesign-variants.config.json
  --variant=variant-1-command     Capture only one variant by name
  --branch=redesign/name          Capture only one variant by branch
  --viewport=desktop|mobile|both  Default: desktop
  --routes=/,/leads               Comma-separated routes; default discovers static App Router pages
  --mobile-mode=sheet|fullpage     Default: sheet
  --out=DIR                       Default: design-variants/screenshots
  --keep-servers                  Leave Next dev servers running
  --no-build                      Skip npm run build before screenshots
  --dry-run                       Print selected variants without starting servers
`);
  process.exit(0);
}

const config = await readConfig(configArg);
const mobileMode = mobileModeArg || config.screenshots?.mobileMode || "sheet";
if (!["sheet", "fullpage"].includes(mobileMode)) {
  throw new Error(`Unknown mobile mode: ${mobileMode}`);
}

const configuredViewport =
  selectedViewport || config.screenshots?.viewport || "desktop";
const viewportNames =
  configuredViewport === "both" ? ["desktop", "mobile"] : [configuredViewport];

for (const viewportName of viewportNames) {
  if (!viewports[viewportName])
    throw new Error(`Unknown viewport: ${viewportName}`);
}

const targetVariants = selectedVariant
  ? config.variants.filter((variant) => variant.name === selectedVariant)
  : selectedBranch
    ? config.variants.filter((variant) => variant.branch === selectedBranch)
    : [...config.variants];

if (!targetVariants.length && (selectedVariant || selectedBranch)) {
  const autoVariant = resolveAutoVariant(
    config,
    selectedVariant,
    selectedBranch
  );
  if (autoVariant) targetVariants.push(autoVariant);
}

if (!targetVariants.length) {
  throw new Error(
    `Unknown variant selection: ${selectedVariant || selectedBranch}`
  );
}

const outputDir = path.resolve(
  rootDir,
  outputDirArg || config.screenshots?.out || "design-variants/screenshots"
);
const startedServers = [];

try {
  await fs.mkdir(outputDir, { recursive: true });

  for (const variant of targetVariants) {
    const variantDir = path.resolve(
      rootDir,
      config.worktreeDir || "design-variants",
      variant.name
    );
    const appDir = path.resolve(variantDir, config.appPath || ".");
    const routes = await resolveRoutes(appDir, config);

    if (dryRun) {
      console.log(`${variant.name}`);
      console.log(`  branch: ${variant.branch || "(none)"}`);
      console.log(`  port: ${variant.port}`);
      console.log(`  dir: ${path.relative(rootDir, appDir)}`);
      console.log(`  routes: ${routes.join(", ")}`);
      console.log(`  viewports: ${viewportNames.join(", ")}`);
      console.log(`  mobile mode: ${mobileMode}`);
      continue;
    }

    if (!noBuild) await run("npm", ["run", "build"], appDir);

    const baseUrl = `http://127.0.0.1:${variant.port}`;
    const alreadyRunning = await isReachable(baseUrl);
    let serverProcess;
    if (!alreadyRunning) {
      serverProcess = spawn(
        "npm",
        [
          "run",
          "dev",
          "--",
          "--hostname",
          "127.0.0.1",
          "--port",
          String(variant.port)
        ],
        {
          cwd: appDir,
          env: process.env,
          stdio: ["ignore", "pipe", "pipe"]
        }
      );

      startedServers.push(serverProcess);
      serverProcess.stdout.on("data", (chunk) =>
        process.stdout.write(`[${variant.name}] ${chunk}`)
      );
      serverProcess.stderr.on("data", (chunk) =>
        process.stderr.write(`[${variant.name}] ${chunk}`)
      );
    }

    await waitForUrl(baseUrl, 45_000, serverProcess);

    const variantOutputDir = path.join(outputDir, variant.name);
    await fs.mkdir(variantOutputDir, { recursive: true });

    for (const route of routes) {
      const url = new URL(route, baseUrl).toString();
      for (const viewportName of viewportNames) {
        const viewport = viewports[viewportName];
        const routeSlug = routeToSlug(route);
        const suffix =
          viewportName === "desktop"
            ? "desktop-fullpage"
            : mobileMode === "sheet"
              ? "mobile-sheet"
              : "mobile-fullpage";
        const file = path.join(variantOutputDir, `${routeSlug}-${suffix}.png`);
        const result =
          viewportName === "mobile" && mobileMode === "sheet"
            ? await captureMobileSheet(url, file, viewport)
            : await captureFullPage(url, file, viewport);
        const warningText = result.warnings
          ? `, warnings: ${result.warnings}`
          : "";
        const segmentText = result.segments
          ? `, segments: ${result.segments}`
          : "";
        console.log(
          `saved ${path.relative(rootDir, file)} (${result.width}x${result.height}, route: ${route}, errors: ${result.errors}${warningText}${segmentText})`
        );
      }
    }
  }
} finally {
  if (!keepServers) {
    for (const child of startedServers) child.kill("SIGTERM");
  }
}

function valueArg(name) {
  return [...args]
    .find((arg) => arg.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function readConfig(configFile) {
  const file = configFile
    ? path.resolve(rootDir, configFile)
    : path.join(rootDir, "design-variants", "redesign-variants.config.json");

  const parsed = JSON.parse(await fs.readFile(file, "utf8"));
  if (!Array.isArray(parsed.variants) || !parsed.variants.length) {
    throw new Error(`${file} must contain a non-empty variants array`);
  }
  return parsed;
}

async function resolveRoutes(appDir, config) {
  if (routesArg) return normalizeRoutes(routesArg.split(","));

  const screenshotConfig = config.screenshots || {};
  if (Array.isArray(screenshotConfig.paths)) {
    return normalizeRoutes(screenshotConfig.paths);
  }

  if (typeof screenshotConfig.path === "string" && screenshotConfig.path) {
    return normalizeRoutes([screenshotConfig.path]);
  }

  const discovered = await discoverAppRouterRoutes(appDir);
  return discovered.length ? discovered : ["/"];
}

function normalizeRoutes(routes) {
  return [
    ...new Set(
      routes
        .map((route) => route.trim())
        .filter(Boolean)
        .map((route) => (route.startsWith("/") ? route : `/${route}`))
        .map((route) => route.replace(/\/+$/, "") || "/")
    )
  ];
}

async function discoverAppRouterRoutes(appDir) {
  const appRouterDir = path.join(appDir, "app");

  try {
    await fs.access(appRouterDir);
  } catch {
    return [];
  }

  const routes = [];
  await walkAppRouter(appRouterDir, [], routes);
  return normalizeRoutes(routes).sort((left, right) => {
    if (left === "/") return -1;
    if (right === "/") return 1;
    return left.localeCompare(right);
  });
}

async function walkAppRouter(dir, segments, routes) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const hasPage = entries.some(
    (entry) => entry.isFile() && /^page\.(tsx|ts|jsx|js|mdx)$/.test(entry.name)
  );

  if (hasPage) routes.push(`/${segments.join("/")}`);

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (shouldSkipRouteDirectory(entry.name)) continue;

    const nextSegments = routeSegmentsForDirectory(entry.name, segments);
    await walkAppRouter(path.join(dir, entry.name), nextSegments, routes);
  }
}

function shouldSkipRouteDirectory(name) {
  return (
    name === "api" ||
    name.startsWith("_") ||
    name.startsWith("@") ||
    name.startsWith("[") ||
    name.startsWith("(.)") ||
    name.startsWith("(..)")
  );
}

function routeSegmentsForDirectory(name, segments) {
  if (name.startsWith("(") && name.endsWith(")")) return segments;
  return [...segments, name];
}

function routeToSlug(route) {
  if (route === "/") return "home";
  return route
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function resolveAutoVariant(config, variantName, branchName) {
  const defaults = config.defaults || {};
  const namePrefix = defaults.namePrefix || "variant";
  const branchPrefix = defaults.branchPrefix || "redesign/lead-dashboard-auto";
  const startPort = defaults.startPort || 5301;
  const nameMatch = variantName?.match(
    new RegExp(`^${escapeRegExp(namePrefix)}-(\\d+)-auto$`)
  );
  const branchMatch = branchName?.match(
    new RegExp(`^${escapeRegExp(branchPrefix)}-(\\d+)$`)
  );
  const number = Number(nameMatch?.[1] || branchMatch?.[1]);

  if (!number) return undefined;

  return {
    name: variantName || `${namePrefix}-${number}-auto`,
    branch: branchName || `${branchPrefix}-${number}`,
    port: startPort + number - 1
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function run(command, commandArgs, cwd) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd,
      stdio: "inherit",
      env: process.env
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `${command} ${commandArgs.join(" ")} failed with exit code ${code}`
          )
        );
    });
  });
}

async function isReachable(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForUrl(url, timeoutMs, serverProcess) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isReachable(url)) return;
    if (serverProcess && serverProcess.exitCode !== null) {
      throw new Error(`Dev server exited before ${url} became reachable`);
    }
    await sleep(300);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function captureFullPage(url, outputFile, viewport) {
  return capturePage(url, outputFile, viewport, "fullpage");
}

async function captureMobileSheet(url, outputFile, viewport) {
  return capturePage(url, outputFile, viewport, "sheet");
}

async function capturePage(url, outputFile, viewport, mode) {
  const chrome = findChrome();
  const userDataDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "lead-dashboard-capture-")
  );
  const chromeProcess = spawn(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      "about:blank"
    ],
    { stdio: "ignore" }
  );

  try {
    const webSocketUrl = await waitForDebugger(
      userDataDir,
      chromeProcess,
      20_000
    );
    const ws = await connectWebSocket(webSocketUrl);
    const messages = createCdpClient(ws);
    let errors = 0;
    let warnings = 0;

    messages.onEvent = (event) => {
      if (event.method === "Runtime.exceptionThrown") errors += 1;
      if (event.method === "Runtime.consoleAPICalled") {
        if (event.params.type === "error") errors += 1;
        if (event.params.type === "warning") warnings += 1;
      }
    };

    await messages.send("Page.enable");
    await messages.send("Runtime.enable");
    await messages.send("Emulation.setDeviceMetricsOverride", viewport);
    await messages.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }]
    });
    await messages.send("Page.navigate", { url });
    await messages.waitForEvent("Page.loadEventFired", 20_000);
    await preparePageForFullPageCapture(messages, viewport.height);

    const dimensions = await getPageDimensions(messages);
    const width = Math.max(viewport.width, dimensions.width);
    const height = Math.max(viewport.height, dimensions.height);

    if (mode === "sheet") {
      const sheet = await captureSheet(messages, viewport, width, height);
      await fs.writeFile(outputFile, Buffer.from(sheet.data, "base64"));
      ws.end();

      return {
        width: sheet.width,
        height: sheet.height,
        segments: sheet.segments,
        errors,
        warnings
      };
    }

    await messages.send("Emulation.setDeviceMetricsOverride", {
      ...viewport,
      width,
      height
    });

    const screenshot = await messages.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height, scale: 1 }
    });

    await fs.writeFile(outputFile, Buffer.from(screenshot.data, "base64"));
    ws.end();

    return { width, height, errors, warnings };
  } finally {
    chromeProcess.kill("SIGTERM");
    await waitForProcessExit(chromeProcess, 3_000);
    await removeDir(userDataDir);
  }
}

async function captureSheet(messages, viewport, pageWidth, pageHeight) {
  const segmentHeight = viewport.height;
  const segments = Math.max(1, Math.ceil(pageHeight / segmentHeight));
  const images = [];

  await messages.send("Emulation.setDeviceMetricsOverride", {
    ...viewport,
    width: viewport.width,
    height: viewport.height
  });

  for (let index = 0; index < segments; index += 1) {
    const y = index * segmentHeight;
    const height = Math.min(segmentHeight, pageHeight - y);
    await evaluate(
      messages,
      `window.scrollTo(0, ${y}); window.dispatchEvent(new Event("scroll")); true;`
    );
    await sleep(180);

    const screenshot = await messages.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: true,
      clip: { x: 0, y, width: pageWidth, height, scale: 1 }
    });
    images.push({ data: screenshot.data, width: pageWidth, height });
  }

  await messages.send("Page.navigate", { url: "about:blank" });
  await messages.waitForEvent("Page.loadEventFired", 20_000);
  await evaluate(
    messages,
    `document.open(); document.write(${JSON.stringify(
      sheetHtml(images, pageWidth, segmentHeight)
    )}); document.close(); true;`
  );
  await evaluate(messages, "document.fonts?.ready", true);

  const sheetWidth = pageWidth * images.length;
  await messages.send("Emulation.setDeviceMetricsOverride", {
    width: sheetWidth,
    height: segmentHeight,
    deviceScaleFactor: 1,
    mobile: false
  });

  const sheet = await messages.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width: sheetWidth,
      height: segmentHeight,
      scale: 1
    }
  });

  return {
    data: sheet.data,
    width: sheetWidth,
    height: segmentHeight,
    segments: images.length
  };
}

function sheetHtml(images, width, height) {
  const body = images
    .map(
      (image) =>
        `<div class="segment"><img src="data:image/png;base64,${image.data}" /></div>`
    )
    .join("");
  const html = `<!doctype html>
<html>
  <head>
    <style>
      html,
      body {
        margin: 0;
        width: ${width * images.length}px;
        height: ${height}px;
        overflow: hidden;
        background: #ffffff;
      }

      body {
        display: flex;
        align-items: flex-start;
      }

      .segment {
        width: ${width}px;
        height: ${height}px;
        overflow: hidden;
        background: #ffffff;
        flex: 0 0 auto;
      }

      img {
        display: block;
        width: ${width}px;
        height: auto;
      }
    </style>
  </head>
  <body>${body}</body>
</html>`;
  return html;
}

async function preparePageForFullPageCapture(messages, viewportHeight) {
  await evaluate(messages, "document.fonts?.ready", true);
  await waitForStableLayout(messages, 8_000);

  await evaluate(
    messages,
    `new Promise(async (resolve) => {
    const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
    const maxY = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight || 0,
      window.innerHeight
    ) - window.innerHeight;
    const step = Math.max(${Math.max(320, viewportHeight - 160)}, 320);

    for (let y = 0; y <= maxY; y += step) {
      window.scrollTo(0, y);
      window.dispatchEvent(new Event("scroll"));
      await sleep(260);
    }

    window.scrollTo(0, maxY);
    window.dispatchEvent(new Event("scroll"));
    await sleep(500);
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("scroll"));
    await sleep(350);
    resolve(true);
  })`,
    true
  );

  await evaluate(
    messages,
    `(() => {
    const style = document.createElement("style");
    style.setAttribute("data-capture-ready", "true");
    style.textContent = \`
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 1ms !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 1ms !important;
      }
    \`;
    document.head.appendChild(style);
    return true;
  })()`
  );

  await waitForStableLayout(messages, 4_000);
}

async function waitForStableLayout(messages, timeoutMs) {
  const startedAt = Date.now();
  let previous;
  let stableReads = 0;

  while (Date.now() - startedAt < timeoutMs) {
    const current = await getPageDimensions(messages);
    if (
      previous &&
      current.width === previous.width &&
      current.height === previous.height
    ) {
      stableReads += 1;
      if (stableReads >= 3) return current;
    } else {
      stableReads = 0;
    }

    previous = current;
    await sleep(250);
  }

  return previous;
}

async function getPageDimensions(messages) {
  const result = await evaluate(
    messages,
    `(() => {
    const doc = document.documentElement;
    const body = document.body;
    return {
      width: Math.ceil(Math.max(doc.scrollWidth, body?.scrollWidth || 0, doc.clientWidth)),
      height: Math.ceil(Math.max(doc.scrollHeight, body?.scrollHeight || 0, doc.clientHeight))
    };
  })()`
  );

  return result.result.value;
}

function evaluate(messages, expression, awaitPromise = false) {
  return messages.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true
  });
}

function findChrome() {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
  ];

  for (const candidate of candidates) {
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("Chrome, Chromium, or Edge was not found in /Applications");
}

async function waitForDebugger(userDataDir, chromeProcess, timeoutMs) {
  const startedAt = Date.now();
  const activePortFile = path.join(userDataDir, "DevToolsActivePort");
  let debugPort;

  while (Date.now() - startedAt < timeoutMs) {
    if (chromeProcess.exitCode !== null) {
      throw new Error(
        `Chrome exited before debugger became available with code ${chromeProcess.exitCode}`
      );
    }

    try {
      if (!debugPort) {
        const activePort = await fs.readFile(activePortFile, "utf8");
        debugPort = activePort.split(/\r?\n/, 1)[0]?.trim();
      }

      if (debugPort) {
        const targets = await getJson(
          `http://127.0.0.1:${debugPort}/json/list`
        );
        const page = targets.find(
          (target) => target.type === "page" && target.webSocketDebuggerUrl
        );
        if (page) return page.webSocketDebuggerUrl;
      }
    } catch {
      await sleep(200);
    }
  }

  throw new Error(
    `Timed out waiting for Chrome debugger in ${path.relative(
      os.tmpdir(),
      userDataDir
    )}`
  );
}

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function connectWebSocket(webSocketUrl) {
  const parsed = new URL(webSocketUrl);
  const key = crypto.randomBytes(16).toString("base64");

  return new Promise((resolve, reject) => {
    const socket = net.createConnection(Number(parsed.port), parsed.hostname);
    let buffer = Buffer.alloc(0);

    socket.on("connect", () => {
      socket.write(
        [
          `GET ${parsed.pathname}${parsed.search} HTTP/1.1`,
          `Host: ${parsed.host}`,
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Key: ${key}`,
          "Sec-WebSocket-Version: 13",
          "",
          ""
        ].join("\r\n")
      );
    });

    socket.on("data", function onHandshake(chunk) {
      buffer = Buffer.concat([buffer, chunk]);
      const marker = buffer.indexOf("\r\n\r\n");
      if (marker === -1) return;

      const header = buffer.subarray(0, marker).toString("utf8");
      if (!header.startsWith("HTTP/1.1 101")) {
        reject(new Error(`WebSocket handshake failed: ${header}`));
        socket.destroy();
        return;
      }

      socket.off("data", onHandshake);
      const rest = buffer.subarray(marker + 4);
      if (rest.length) socket.unshift(rest);
      resolve(socket);
    });

    socket.on("error", reject);
  });
}

function createCdpClient(socket) {
  let id = 0;
  let buffer = Buffer.alloc(0);
  const pending = new Map();
  const eventWaiters = new Map();
  const client = {
    onEvent: undefined,
    send(method, params = {}) {
      const messageId = ++id;
      socket.write(
        encodeWebSocketFrame(JSON.stringify({ id: messageId, method, params }))
      );
      return new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
      });
    },
    waitForEvent(method, timeoutMs) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Timed out waiting for ${method}`));
        }, timeoutMs);
        eventWaiters.set(method, (params) => {
          clearTimeout(timer);
          resolve(params);
        });
      });
    }
  };

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const decoded = decodeWebSocketFrame(buffer);
      if (!decoded) break;
      buffer = buffer.subarray(decoded.bytes);
      if (!decoded.payload.length) continue;

      const message = JSON.parse(decoded.payload.toString("utf8"));
      if (message.id && pending.has(message.id)) {
        const request = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) request.reject(new Error(message.error.message));
        else request.resolve(message.result);
      } else if (message.method) {
        client.onEvent?.(message);
        const waiter = eventWaiters.get(message.method);
        if (waiter) {
          eventWaiters.delete(message.method);
          waiter(message.params);
        }
      }
    }
  });

  socket.on("error", (error) => {
    for (const request of pending.values()) request.reject(error);
    pending.clear();
  });

  return client;
}

function encodeWebSocketFrame(text) {
  const payload = Buffer.from(text);
  const mask = crypto.randomBytes(4);
  let header;

  if (payload.length < 126) {
    header = Buffer.from([0x81, 0x80 | payload.length]);
  } else if (payload.length < 65_536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }

  const masked = Buffer.alloc(payload.length);
  for (let index = 0; index < payload.length; index += 1) {
    masked[index] = payload[index] ^ mask[index % 4];
  }

  return Buffer.concat([header, mask, masked]);
}

function decodeWebSocketFrame(buffer) {
  if (buffer.length < 2) return undefined;

  const opcode = buffer[0] & 0x0f;
  const masked = Boolean(buffer[1] & 0x80);
  let length = buffer[1] & 0x7f;
  let offset = 2;

  if (length === 126) {
    if (buffer.length < 4) return undefined;
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    if (buffer.length < 10) return undefined;
    length = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  const maskOffset = masked ? 4 : 0;
  if (buffer.length < offset + maskOffset + length) return undefined;

  const mask = masked ? buffer.subarray(offset, offset + 4) : undefined;
  const payloadStart = offset + maskOffset;
  const payload = Buffer.from(
    buffer.subarray(payloadStart, payloadStart + length)
  );

  if (mask) {
    for (let index = 0; index < payload.length; index += 1) {
      payload[index] = payload[index] ^ mask[index % 4];
    }
  }

  if (opcode === 0x8)
    return { bytes: payloadStart + length, payload: Buffer.alloc(0) };
  return { bytes: payloadStart + length, payload };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForProcessExit(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null)
    return Promise.resolve();

  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function removeDir(dir) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await fs.rm(dir, {
        recursive: true,
        force: true,
        maxRetries: 3,
        retryDelay: 200
      });
      return;
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(300);
    }
  }
}
