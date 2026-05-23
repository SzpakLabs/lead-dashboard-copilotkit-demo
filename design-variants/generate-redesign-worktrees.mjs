#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const args = process.argv.slice(2);
const flags = new Set(args);

const configArg = valueArg("--config");
const countArg = valueArg("--count");
const startArg = valueArg("--start");
const variantArg = valueArg("--variant");
const branchArg = valueArg("--branch");
const modelArg = valueArg("--model");
const reasoningEffortArg = valueArg("--reasoning-effort");
const skipAgent = flags.has("--skip-agent");
const skipScreenshots = flags.has("--skip-screenshots");
const skipInstall = flags.has("--skip-install");
const skipResearch = flags.has("--skip-research");
const noBuildScreenshots = flags.has("--no-build-screenshots");
const dryRun = flags.has("--dry-run");

if (flags.has("--help")) {
  console.log(`Usage:
  node design-variants/generate-redesign-worktrees.mjs [options]

Options:
  --config=FILE              Default: design-variants/redesign-variants.config.json
  --count=N                  Number of variants when --start is set, otherwise first N
  --start=N                  Start from variant number N
  --variant=NAME             Run one configured variant
  --branch=BRANCH            Run one configured branch
  --model=MODEL              Pass a model to codex exec
  --reasoning-effort=EFFORT  Pass model_reasoning_effort to codex exec
  --skip-research            Do not run Lazyweb research first
  --skip-agent               Create/install only, do not run Codex
  --skip-screenshots         Do not run screenshot capture after agent
  --skip-install             Do not run npm install when node_modules is missing
  --no-build-screenshots     Pass --no-build to screenshot capture
  --dry-run                  Print commands without running them
`);
  process.exit(0);
}

const configPath = path.resolve(
  rootDir,
  configArg || "design-variants/redesign-variants.config.json"
);
const config = JSON.parse(await fs.readFile(configPath, "utf8"));
const variants = selectVariants(expandVariants(config, getExpandCount()));
const sourceRepo = path.resolve(rootDir, config.sourceRepo);
const worktreeRoot = path.resolve(
  rootDir,
  config.worktreeDir || "design-variants"
);
const appPath = config.appPath || ".";
const promptTemplatePath = path.resolve(
  rootDir,
  config.promptTemplate || "design-variants/redesign-agent-prompt.md"
);
const researchPath = path.resolve(
  rootDir,
  config.researchOutput || "design-variants/lazyweb-research.md"
);
const promptTemplate = await fs.readFile(promptTemplatePath, "utf8");

if (!variants.length) {
  throw new Error("No variants selected.");
}

if (!existsSync(sourceRepo)) {
  throw new Error(`sourceRepo does not exist: ${sourceRepo}`);
}

if (!skipResearch && !dryRun) {
  await run(
    "node",
    [
      "design-variants/run-lazyweb-research.mjs",
      `--config=${path.relative(rootDir, configPath)}`
    ],
    rootDir
  );
}

for (const variant of variants) {
  const variantDir = path.join(worktreeRoot, variant.name);
  const appDir = path.resolve(variantDir, appPath);

  if (dryRun) {
    printPlan(variant, variantDir, appDir);
    continue;
  }

  await ensureWorktree(variant, variantDir);
  await copyEnvFiles(variantDir);
  await copyResearchFile(variantDir);

  if (!skipInstall && !existsSync(path.join(appDir, "node_modules"))) {
    await run("npm", ["install"], appDir);
  }

  if (!skipAgent) {
    const prompt = renderPrompt(promptTemplate, {
      variantName: variant.name,
      branch: variant.branch,
      port: String(variant.port),
      direction:
        variant.direction ||
        "Choose a distinctive lead-operations dashboard direction that does not duplicate other variants.",
      appPath,
      researchPath:
        config.researchOutput || "design-variants/lazyweb-research.md",
      redesignGoal:
        config.redesignGoal ||
        "Reorganize the app into a summary-led lead operations console with focused pages and dialog-based add/edit workflows.",
      appStructure: formatPromptBlock(config.appStructure),
      workflowExpectations: formatPromptBlock(config.workflowExpectations)
    });

    const agent = config.agent || {};
    const command = agent.command || "codex";
    const commandArgs = [
      ...(agent.args || [
        "--ask-for-approval",
        "never",
        "exec",
        "--sandbox",
        "workspace-write",
        "-"
      ])
    ];

    applyCodexOverrides(commandArgs, {
      model: modelArg,
      reasoningEffort: reasoningEffortArg
    });

    await run(command, commandArgs, variantDir, prompt);
  }

  if (!skipScreenshots) {
    const screenshotArgs = [
      "design-variants/capture-fullpage-screenshots.mjs",
      `--config=${path.relative(rootDir, configPath)}`,
      `--variant=${variant.name}`,
      `--branch=${variant.branch}`,
      `--viewport=${config.screenshots?.viewport || "both"}`,
      `--out=${config.screenshots?.out || "design-variants/screenshots"}`
    ];

    if (noBuildScreenshots) screenshotArgs.push("--no-build");
    await run("node", screenshotArgs, rootDir);
  }
}

function valueArg(name) {
  return args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
}

function selectVariants(allVariants) {
  if (variantArg)
    return allVariants.filter((variant) => variant.name === variantArg);
  if (branchArg)
    return allVariants.filter((variant) => variant.branch === branchArg);
  if (startArg && countArg) {
    const start = Number(startArg) - 1;
    return allVariants.slice(start, start + Number(countArg));
  }
  if (startArg) return allVariants.slice(Number(startArg) - 1);
  if (countArg) return allVariants.slice(0, Number(countArg));
  return allVariants;
}

function getExpandCount() {
  if (!countArg) return undefined;
  if (!startArg) return Number(countArg);
  return Number(startArg) + Number(countArg) - 1;
}

function expandVariants(config, count) {
  const variants = [...config.variants];
  if (!count) return variants;

  const startPort = config.defaults?.startPort || 5301;
  const namePrefix = config.defaults?.namePrefix || "variant";
  const branchPrefix =
    config.defaults?.branchPrefix || "redesign/lead-dashboard-auto";

  for (let index = variants.length; index < count; index += 1) {
    const number = index + 1;
    variants.push({
      name: `${namePrefix}-${number}-auto`,
      branch: `${branchPrefix}-${number}`,
      port: startPort + index,
      direction: `Auto variant ${number}: choose a lead-operations dashboard direction that is visibly different from all earlier variants.`
    });
  }

  return variants.slice(0, count);
}

async function ensureWorktree(variant, variantDir) {
  if (existsSync(path.join(variantDir, ".git"))) {
    console.log(`worktree exists: ${path.relative(rootDir, variantDir)}`);
    return;
  }

  await fs.mkdir(path.dirname(variantDir), { recursive: true });
  const branchExists = await commandSucceeds(
    "git",
    ["rev-parse", "--verify", `refs/heads/${variant.branch}`],
    sourceRepo
  );

  if (branchExists) {
    await run(
      "git",
      ["worktree", "add", variantDir, variant.branch],
      sourceRepo
    );
  } else {
    await run(
      "git",
      [
        "worktree",
        "add",
        "-b",
        variant.branch,
        variantDir,
        config.baseRef || "HEAD"
      ],
      sourceRepo
    );
  }
}

async function copyEnvFiles(variantDir) {
  for (const envFile of config.copyEnvFiles || []) {
    const source = path.join(sourceRepo, envFile);
    const target = path.join(variantDir, envFile);
    if (!existsSync(source) || existsSync(target)) continue;
    await fs.copyFile(source, target);
  }
}

async function copyResearchFile(variantDir) {
  if (!existsSync(researchPath)) return;
  const target = path.join(
    variantDir,
    config.researchOutput || "design-variants/lazyweb-research.md"
  );
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(researchPath, target);
}

function printPlan(variant, variantDir, appDir) {
  const exists = existsSync(path.join(variantDir, ".git"));
  const steps = [];

  steps.push(
    exists
      ? "reuse worktree"
      : `create worktree from ${config.baseRef || "HEAD"}`
  );
  if (!skipResearch) steps.push("run Lazyweb research");
  if (!skipInstall && !existsSync(path.join(appDir, "node_modules")))
    steps.push("npm install");
  if (!skipAgent) steps.push("run codex redesign prompt");
  if (!skipScreenshots)
    steps.push(`capture ${config.screenshots?.viewport || "both"} screenshots`);

  console.log(`${variant.name}`);
  console.log(`  branch: ${variant.branch}`);
  console.log(`  port: ${variant.port}`);
  console.log(`  dir: ${path.relative(rootDir, variantDir)}`);
  console.log(`  steps: ${steps.join(" -> ")}`);
}

async function commandSucceeds(command, commandArgs, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, { cwd, stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("exit", (code) => resolve(code === 0));
  });
}

async function capture(command, commandArgs, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env
    });
    const chunks = [];
    const errorChunks = [];

    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errorChunks.push(chunk));
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks).toString("utf8"));
      } else {
        reject(
          new Error(
            `${command} ${commandArgs.join(" ")} failed with exit code ${code}: ${Buffer.concat(errorChunks).toString("utf8")}`
          )
        );
      }
    });
  });
}

async function run(command, commandArgs, cwd, stdin) {
  const label = `${command} ${commandArgs.join(" ")}`;
  console.log(`[run] ${label}`);

  await new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd,
      stdio: stdin ? ["pipe", "inherit", "inherit"] : "inherit",
      env: process.env
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed with exit code ${code}`));
    });

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });
}

function renderPrompt(template, values) {
  return template.replaceAll(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}

function formatPromptBlock(value) {
  if (Array.isArray(value)) return value.map((item) => `- ${item}`).join("\n");
  if (typeof value === "string" && value.trim()) return value.trim();
  return "- Use product judgment to create focused pages and dialog-based workflows that preserve existing behavior.";
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
