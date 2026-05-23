#!/usr/bin/env node
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const args = process.argv.slice(2);
const flags = new Set(args);

const configArg = valueArg("--config");
const archiveArg = valueArg("--archive") || "latest";
const variantArg = valueArg("--variant");
const force = flags.has("--force");
const all = flags.has("--all");
const dryRun = flags.has("--dry-run");
const restoreResearch = flags.has("--restore-research");

if (flags.has("--help")) {
  console.log(`Usage:
  node design-variants/restore-archive.mjs [options]

Options:
  --config=FILE        Default: design-variants/redesign-variants.config.json
  --archive=RUN        Archive run name, or latest. Default: latest
  --variant=NAME       Restore one variant from the archive
  --all                Restore every variant in the archive
  --force              Replace existing target branch/worktree/screenshots
  --restore-research   Restore archived Lazyweb research file
  --dry-run            Print actions without changing files or git state
`);
  process.exit(0);
}

if (!variantArg && !all) {
  throw new Error("Pass --variant=NAME or --all");
}

const configPath = path.resolve(
  rootDir,
  configArg || "design-variants/redesign-variants.config.json"
);
const config = JSON.parse(await fs.readFile(configPath, "utf8"));
const sourceRepo = path.resolve(rootDir, config.sourceRepo || rootDir);
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
const researchPath = path.resolve(
  rootDir,
  config.researchOutput || "design-variants/lazyweb-research.md"
);
const archiveName = await resolveArchiveName(archiveArg);
const archiveDir = path.join(archiveRoot, archiveName);
const variants = await resolveVariants();

if (!variants.length) {
  throw new Error(`No archived variants selected in ${archiveName}`);
}

for (const variant of variants) {
  await restoreVariant(variant);
}

if (restoreResearch) {
  await restoreArchivedResearch();
}

function valueArg(name) {
  return args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
}

async function resolveArchiveName(value) {
  const names = await directoryNames(archiveRoot);
  if (!names.length) throw new Error(`No archives found in ${archiveRoot}`);

  if (value === "latest") return names.sort().at(-1);
  if (names.includes(value)) return value;

  throw new Error(`Archive not found: ${value}`);
}

async function resolveVariants() {
  const variantNames = all ? await directoryNames(archiveDir) : [variantArg];
  const selected = [];

  for (const name of variantNames.filter((name) =>
    name.startsWith("variant-")
  )) {
    const archiveVariantDir = path.join(archiveDir, name);
    const metadata = await readJson(
      path.join(archiveVariantDir, "variant.json")
    );
    if (!metadata) continue;
    selected.push({
      ...metadata,
      name,
      archiveVariantDir,
      archivedBranch: await findArchivedBranch(metadata.branch)
    });
  }

  return selected.sort((left, right) => left.name.localeCompare(right.name));
}

async function restoreVariant(variant) {
  const variantDir = path.join(worktreeRoot, variant.name);
  const targetScreenshotsDir = path.join(screenshotsRoot, variant.name);
  const sourceScreenshotsDir = path.join(
    variant.archiveVariantDir,
    "screenshots",
    variant.name
  );
  const sourceFlatScreenshotsDir = path.join(
    variant.archiveVariantDir,
    "screenshots",
    "flat"
  );
  const sourceSnapshotDir = path.join(variant.archiveVariantDir, "worktree");

  if (!variant.branch) {
    throw new Error(`${variant.name} archive does not include a branch`);
  }

  if (!variant.archivedBranch) {
    throw new Error(`Archived branch not found for ${variant.name}`);
  }

  if (!force) {
    await assertRestoreTargetIsFree(variant, variantDir, targetScreenshotsDir);
  } else {
    await removeExistingWorktree(variantDir);
    if (await branchExists(variant.branch)) {
      await runStep(
        `delete existing branch ${variant.branch}`,
        "git",
        ["branch", "-D", variant.branch],
        sourceRepo
      );
    }
    await fs.rm(targetScreenshotsDir, { recursive: true, force: true });
    await removeFlatScreenshots(variant.name);
  }

  await runStep(
    `restore ${variant.name} branch`,
    "git",
    ["branch", "-m", variant.archivedBranch, variant.branch],
    sourceRepo
  );

  await runStep(
    `add ${variant.name} worktree`,
    "git",
    ["worktree", "add", variantDir, variant.branch],
    sourceRepo
  );

  if (existsSync(sourceSnapshotDir)) {
    await copyStep(sourceSnapshotDir, variantDir);
  }

  if (existsSync(sourceScreenshotsDir)) {
    await copyStep(sourceScreenshotsDir, targetScreenshotsDir);
  }

  if (existsSync(sourceFlatScreenshotsDir)) {
    await restoreFlatScreenshots(sourceFlatScreenshotsDir);
  }

  console.log(`restored ${variant.name}`);
}

async function assertRestoreTargetIsFree(
  variant,
  variantDir,
  targetScreenshotsDir
) {
  if (existsSync(variantDir)) {
    throw new Error(
      `${variant.name} worktree exists. Re-run with --force to replace it.`
    );
  }

  if (existsSync(targetScreenshotsDir)) {
    throw new Error(
      `${variant.name} screenshots exist. Re-run with --force to replace them.`
    );
  }

  if (await branchExists(variant.branch)) {
    throw new Error(
      `${variant.branch} already exists. Re-run with --force to replace it.`
    );
  }
}

async function removeExistingWorktree(variantDir) {
  if (!existsSync(variantDir)) return;

  if (existsSync(path.join(variantDir, ".git"))) {
    await runStep(
      `remove existing worktree ${path.basename(variantDir)}`,
      "git",
      ["worktree", "remove", "--force", variantDir],
      sourceRepo
    );
  } else {
    await fs.rm(variantDir, { recursive: true, force: true });
  }
}

async function removeFlatScreenshots(variantName) {
  if (!existsSync(screenshotsRoot)) return;

  const entries = await fs.readdir(screenshotsRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.isFile() &&
      entry.name.startsWith(`${variantName}-`) &&
      entry.name.endsWith(".png")
    ) {
      if (dryRun) {
        console.log(
          `[remove] ${path.relative(rootDir, path.join(screenshotsRoot, entry.name))}`
        );
      } else {
        await fs.rm(path.join(screenshotsRoot, entry.name), { force: true });
      }
    }
  }
}

async function restoreFlatScreenshots(sourceFlatScreenshotsDir) {
  const entries = await fs.readdir(sourceFlatScreenshotsDir, {
    withFileTypes: true
  });
  await fs.mkdir(screenshotsRoot, { recursive: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".png")) continue;
    await copyStep(
      path.join(sourceFlatScreenshotsDir, entry.name),
      path.join(screenshotsRoot, entry.name)
    );
  }
}

async function restoreArchivedResearch() {
  const source = path.join(archiveDir, path.basename(researchPath));
  if (!existsSync(source)) {
    throw new Error(`Archived research not found: ${source}`);
  }

  await copyStep(source, researchPath);
}

async function findArchivedBranch(originalBranch) {
  if (!originalBranch) return undefined;

  const branches = await listBranches();
  const base = `archive/${archiveName}/${originalBranch.replaceAll("/", "-")}`;
  return branches.find(
    (branch) => branch === base || branch.startsWith(`${base}-`)
  );
}

async function branchExists(branch) {
  return (await listBranches()).includes(branch);
}

async function listBranches() {
  const output = await capture(
    "git",
    ["branch", "--format=%(refname:short)"],
    sourceRepo
  );
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function copyStep(source, target) {
  if (dryRun) {
    console.log(
      `[copy] ${path.relative(rootDir, source)} -> ${path.relative(rootDir, target)}`
    );
    return;
  }

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true, force: true });
}

async function runStep(label, command, commandArgs, cwd) {
  console.log(`[run] ${label}`);

  if (dryRun) {
    console.log(`  ${command} ${commandArgs.join(" ")}`);
    return;
  }

  await run(command, commandArgs, cwd);
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

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return undefined;
  }
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
