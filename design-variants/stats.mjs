#!/usr/bin/env node
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const args = process.argv.slice(2);
const configArg = valueArg("--config");

if (args.includes("--help")) {
  console.log(`Usage:
  node design-variants/stats.mjs [options]

Options:
  --config=FILE  Default: design-variants/redesign-variants.config.json
`);
  process.exit(0);
}

const configPath = path.resolve(
  rootDir,
  configArg || "design-variants/redesign-variants.config.json"
);
const config = JSON.parse(await fs.readFile(configPath, "utf8"));
const worktreeRoot = path.resolve(
  rootDir,
  config.worktreeDir || "design-variants"
);
const screenshotsRoot = path.resolve(
  rootDir,
  config.screenshots?.out || "design-variants/screenshots"
);
const archiveRoot = path.resolve(
  rootDir,
  config.archiveDir || "design-variants/archive"
);
const branches = await listBranches(config.sourceRepo || rootDir);
const currentVariants = await getCurrentVariants();
const archivedRuns = await getArchivedRuns();

printSummary();
printCurrentVariants();
printArchivedVariants();

function valueArg(name) {
  return args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
}

async function getCurrentVariants() {
  const configured = new Map(
    (config.variants || []).map((variant) => [variant.name, variant])
  );
  const foundNames = new Set(configured.keys());

  for (const name of await directoryNames(worktreeRoot)) {
    if (name.startsWith("variant-")) foundNames.add(name);
  }

  for (const name of await directoryNames(screenshotsRoot)) {
    if (name.startsWith("variant-")) foundNames.add(name);
  }

  return Promise.all(
    [...foundNames].sort(compareVariantNames).map(async (name) => {
      const configuredVariant = configured.get(name);
      const branch =
        configuredVariant?.branch || findLikelyBranchForVariant(name, branches);
      const worktreeDir = path.join(worktreeRoot, name);
      const screenshotsDir = path.join(screenshotsRoot, name);

      return {
        name,
        branch,
        port: configuredVariant?.port,
        configured: Boolean(configuredVariant),
        worktree: existsSync(path.join(worktreeDir, ".git")),
        branchExists: branch ? branches.includes(branch) : false,
        screenshots: await countPngFiles(screenshotsDir),
        flatScreenshots: await countFlatScreenshots(name),
        dirty: existsSync(path.join(worktreeDir, ".git"))
          ? await gitStatusShort(worktreeDir)
          : undefined
      };
    })
  );
}

async function getArchivedRuns() {
  const runNames = await directoryNames(archiveRoot);
  const runs = [];

  for (const runName of runNames.sort().reverse()) {
    const runDir = path.join(archiveRoot, runName);
    const variantNames = await directoryNames(runDir);
    const variants = await Promise.all(
      variantNames
        .filter((name) => name.startsWith("variant-"))
        .sort(compareVariantNames)
        .map(async (name) => {
          const variantDir = path.join(runDir, name);
          const metadata = await readJson(
            path.join(variantDir, "variant.json")
          );
          return {
            name,
            branch: metadata?.branch,
            screenshots:
              (await countPngFiles(path.join(variantDir, "screenshots"))) +
              (await countPngFiles(
                path.join(variantDir, "screenshots", "flat")
              )),
            hasSnapshot: existsSync(path.join(variantDir, "worktree")),
            hasDiff:
              (await fileSize(path.join(variantDir, "worktree.diff"))) > 0 ||
              (await fileSize(path.join(variantDir, "staged.diff"))) > 0
          };
        })
    );

    runs.push({
      name: runName,
      variants,
      hasResearch: existsSync(path.join(runDir, "lazyweb-research.md"))
    });
  }

  return runs;
}

function printSummary() {
  const currentWorktrees = currentVariants.filter(
    (variant) => variant.worktree
  );
  const currentScreenshots = currentVariants.reduce(
    (sum, variant) => sum + variant.screenshots + variant.flatScreenshots,
    0
  );
  const archivedVariants = archivedRuns.reduce(
    (sum, run) => sum + run.variants.length,
    0
  );
  const archivedScreenshots = archivedRuns.reduce(
    (sum, run) =>
      sum +
      run.variants.reduce(
        (variantSum, variant) => variantSum + variant.screenshots,
        0
      ),
    0
  );

  console.log("Variant stats");
  console.log(`  current variants: ${currentVariants.length}`);
  console.log(`  current worktrees: ${currentWorktrees.length}`);
  console.log(`  current screenshots: ${currentScreenshots}`);
  console.log(`  archive runs: ${archivedRuns.length}`);
  console.log(`  archived variants: ${archivedVariants}`);
  console.log(`  archived screenshots: ${archivedScreenshots}`);
}

function printCurrentVariants() {
  console.log("");
  console.log("Current");

  if (!currentVariants.length) {
    console.log("  none");
    return;
  }

  for (const variant of currentVariants) {
    const status = [
      variant.configured ? "configured" : "unconfigured",
      variant.worktree ? "worktree" : "no-worktree",
      variant.branchExists ? "branch" : "no-branch",
      variant.dirty ? "dirty" : "clean"
    ].join(", ");
    const port = variant.port ? `, port ${variant.port}` : "";
    const screenshots = variant.screenshots + variant.flatScreenshots;
    console.log(
      `  ${variant.name}${port}: ${status}, screenshots ${screenshots}`
    );
    if (variant.branch) console.log(`    branch: ${variant.branch}`);
  }
}

function printArchivedVariants() {
  console.log("");
  console.log("Archived");

  if (!archivedRuns.length) {
    console.log("  none");
    return;
  }

  for (const run of archivedRuns) {
    const screenshotCount = run.variants.reduce(
      (sum, variant) => sum + variant.screenshots,
      0
    );
    const research = run.hasResearch ? ", research" : "";
    console.log(
      `  ${run.name}: ${run.variants.length} variants, ${screenshotCount} screenshots${research}`
    );

    for (const variant of run.variants) {
      const snapshot = variant.hasSnapshot ? "snapshot" : "no-snapshot";
      const diff = variant.hasDiff ? ", diff" : "";
      console.log(
        `    ${variant.name}: ${variant.screenshots} screenshots, ${snapshot}${diff}`
      );
      if (variant.branch) console.log(`      branch: ${variant.branch}`);
    }
  }
}

async function directoryNames(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

async function countPngFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let count = 0;

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) count += await countPngFiles(entryPath);
      if (entry.isFile() && entry.name.endsWith(".png")) count += 1;
    }

    return count;
  } catch {
    return 0;
  }
}

async function countFlatScreenshots(variantName) {
  try {
    const entries = await fs.readdir(screenshotsRoot, { withFileTypes: true });
    return entries.filter(
      (entry) =>
        entry.isFile() &&
        entry.name.startsWith(`${variantName}-`) &&
        entry.name.endsWith(".png")
    ).length;
  } catch {
    return 0;
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return undefined;
  }
}

async function fileSize(file) {
  try {
    return (await fs.stat(file)).size;
  } catch {
    return 0;
  }
}

async function listBranches(cwd) {
  try {
    const output = await capture(
      "git",
      ["branch", "--format=%(refname:short)"],
      cwd
    );
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function gitStatusShort(cwd) {
  try {
    return (await capture("git", ["status", "--short"], cwd)).trim();
  } catch {
    return undefined;
  }
}

function findLikelyBranchForVariant(name, branchNames) {
  const numberMatch = name.match(/^variant-(\d+)-auto$/);
  if (numberMatch) {
    const branch = `redesign/lead-dashboard-auto-${numberMatch[1]}`;
    if (branchNames.includes(branch)) return branch;
  }

  return branchNames.find((branch) => branch.endsWith(name));
}

function compareVariantNames(left, right) {
  const leftNumber = Number(left.match(/^variant-(\d+)/)?.[1]);
  const rightNumber = Number(right.match(/^variant-(\d+)/)?.[1]);

  if (leftNumber && rightNumber && leftNumber !== rightNumber) {
    return leftNumber - rightNumber;
  }

  return left.localeCompare(right);
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
