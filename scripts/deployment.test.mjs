import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { builtinModules } from "node:module";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();
const workspacePackages = [
  "apps/api",
  "apps/web",
  "apps/vendor",
  "apps/admin",
  "packages/ai",
  "packages/auth",
  "packages/config",
  "packages/database",
  "packages/notifications",
  "packages/payments",
  "packages/types",
  "packages/ui",
  "packages/utils"
];

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

test("root is configured for pnpm and Vercel uses pnpm commands", async () => {
  const rootPackage = await readJson("package.json");
  const vercel = await readJson("vercel.json");
  const workspace = await readFile(path.join(root, "pnpm-workspace.yaml"), "utf8");

  assert.match(rootPackage.packageManager, /^pnpm@/);
  assert.equal(vercel.installCommand, "pnpm install --frozen-lockfile");
  assert.equal(vercel.buildCommand, "pnpm build");
  assert.match(workspace, /apps\/\*/);
  assert.match(workspace, /packages\/\*/);
});

test("shared UI and config packages declare Vercel build dependencies", async () => {
  const ui = await readJson("packages/ui/package.json");
  const config = await readJson("packages/config/package.json");

  assert.equal(ui.peerDependencies.react, "^19.0.0");
  assert.equal(ui.peerDependencies["react-dom"], "^19.0.0");
  assert.ok(ui.devDependencies["@types/react"]);
  assert.ok(ui.devDependencies["@types/react-dom"]);
  assert.ok(ui.devDependencies.typescript);
  assert.ok(config.dependencies.zod);
});

test("workspace package imports are declared in their own manifests", async () => {
  const missing = [];

  for (const relativePackagePath of workspacePackages) {
    const packageJson = await readJson(`${relativePackagePath}/package.json`);
    const declared = new Set([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
      ...Object.keys(packageJson.optionalDependencies ?? {})
    ]);
    const used = new Set();

    for (const file of await listSourceFiles(path.join(root, relativePackagePath))) {
      const source = await readFile(file, "utf8");

      for (const specifier of extractBareImports(source)) {
        used.add(specifier);
      }
    }

    for (const dependency of used) {
      if (dependency !== packageJson.name && !declared.has(dependency)) {
        missing.push(`${packageJson.name}: ${dependency}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (["node_modules", ".next", "dist", "coverage"].includes(entry.name)) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(absolutePath)));
      continue;
    }

    const info = await stat(absolutePath);
    if (info.isFile() && /\.(ts|tsx|js|mjs|cjs)$/.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

function extractBareImports(source) {
  const builtins = new Set([...builtinModules, ...builtinModules.map((moduleName) => `node:${moduleName}`)]);
  const importPattern =
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?["']([^"']+)["']|require\(["']([^"']+)["']\)/g;
  const imports = [];

  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2];

    if (!specifier || specifier.startsWith(".") || specifier.startsWith("/") || builtins.has(specifier)) {
      continue;
    }

    imports.push(specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0]);
  }

  return imports;
}
