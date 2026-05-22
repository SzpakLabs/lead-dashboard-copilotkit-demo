#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const args = process.argv.slice(2);
const flags = new Set(args);

const configArg = valueArg("--config");
const outputArg = valueArg("--out");
const modelArg = valueArg("--model");
const reasoningEffortArg = valueArg("--reasoning-effort");
const dryRun = flags.has("--dry-run");

if (flags.has("--help")) {
  console.log(`Usage:
  node design-variants/run-lazyweb-research.mjs [options]

Options:
  --config=FILE   Default: design-variants/redesign-variants.config.json
  --out=FILE      Override research output file
  --model=MODEL   Pass a model to codex exec
  --reasoning-effort=EFFORT
                 Pass model_reasoning_effort to codex exec
  --dry-run       Print the prompt without running Codex
`);
  process.exit(0);
}

const configPath = path.resolve(
  rootDir,
  configArg || "design-variants/redesign-variants.config.json"
);
const config = JSON.parse(await fs.readFile(configPath, "utf8"));
const promptPath = path.resolve(
  rootDir,
  config.researchPromptTemplate || "design-variants/lazyweb-research-prompt.md"
);
const outputPath = path.resolve(
  rootDir,
  outputArg || config.researchOutput || "design-variants/lazyweb-research.md"
);

if (!existsSync(promptPath)) {
  throw new Error(`Research prompt does not exist: ${promptPath}`);
}

const promptTemplate = await fs.readFile(promptPath, "utf8");
const research = config.research || {};
const prompt = renderPrompt(promptTemplate, {
  queries: JSON.stringify(research.queries || [], null, 2),
  platform: research.platform || "desktop",
  limit: String(research.limit || 8),
  categories: JSON.stringify(research.categories || [], null, 2),
  outputPath: path.relative(rootDir, outputPath)
});

if (dryRun) {
  console.log(prompt);
  process.exit(0);
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });

const command = research.command || "codex";
const commandArgs = [
  ...(research.args || [
    "exec",
    "--dangerously-bypass-approvals-and-sandbox",
    "-"
  ])
];

applyCodexOverrides(commandArgs, {
  model: modelArg,
  reasoningEffort: reasoningEffortArg
});

await run(command, commandArgs, rootDir, prompt);

if (!existsSync(outputPath)) {
  throw new Error(
    `Research did not create ${path.relative(rootDir, outputPath)}`
  );
}

console.log(`saved ${path.relative(rootDir, outputPath)}`);

function valueArg(name) {
  return args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
}

function renderPrompt(template, values) {
  return template.replaceAll(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}

function applyCodexOverrides(commandArgs, { model, reasoningEffort }) {
  const execIndex = commandArgs.indexOf("exec");
  const insertAt = execIndex === -1 ? 0 : execIndex + 1;

  if (model) {
    removeOption(commandArgs, "--model", 1);
    commandArgs.splice(insertAt, 0, "--model", model);
  }

  if (reasoningEffort) {
    removeConfig(commandArgs, "model_reasoning_effort");
    commandArgs.splice(
      insertAt,
      0,
      "-c",
      `model_reasoning_effort=${JSON.stringify(reasoningEffort)}`
    );
  }
}

function removeOption(commandArgs, option, valueCount) {
  for (let index = commandArgs.length - 1; index >= 0; index -= 1) {
    if (commandArgs[index] !== option) continue;
    commandArgs.splice(index, valueCount + 1);
  }
}

function removeConfig(commandArgs, key) {
  for (let index = commandArgs.length - 2; index >= 0; index -= 1) {
    if (
      (commandArgs[index] === "-c" || commandArgs[index] === "--config") &&
      commandArgs[index + 1]?.startsWith(`${key}=`)
    ) {
      commandArgs.splice(index, 2);
    }
  }
}

async function run(command, commandArgs, cwd, stdin) {
  const label = `${command} ${commandArgs.join(" ")}`;
  console.log(`[run] ${label}`);

  await new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd,
      stdio: ["pipe", "inherit", "inherit"],
      env: process.env
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed with exit code ${code}`));
    });

    child.stdin.write(stdin);
    child.stdin.end();
  });
}
