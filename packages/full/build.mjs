import { build } from "esbuild";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageDir = __dirname;
const srcIndexFile = resolve(packageDir, "src/index.js");
const srcTypesFile = resolve(packageDir, "src/index.d.ts");
const distDir = resolve(packageDir, "dist");
const distClientsDir = resolve(distDir, "clients");
const repoNodeModules = resolve(packageDir, "..", "..", "node_modules");

function loadAliasMap() {
  const source = readFileSync(srcIndexFile, "utf-8");
  const regex = /^export \* as ([\w$]+) from "([^"]+)";$/gm;
  const map = new Map();
  let match;
  while ((match = regex.exec(source)) !== null) {
    const [, alias, pkg] = match;
    map.set(alias, pkg);
  }
  if (map.size === 0) {
    throw new Error("No AWS clients found in src/index.js");
  }
  return map;
}

function ensureCleanDist() {
  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distClientsDir, { recursive: true });
}

function createTempEntryFiles(aliasMap) {
  const tempDir = mkdtempSync(join(tmpdir(), "awspack-entries-"));
  for (const [alias, pkg] of aliasMap.entries()) {
    const entryPath = join(tempDir, `${alias}.js`);
    const contents = `
export * from "${pkg}";
import * as client from "${pkg}";
export default client;
`;
    writeFileSync(entryPath, contents.trimStart(), "utf-8");
  }
  return tempDir;
}

async function buildClients(aliasMap, tempDir) {
  const entryPoints = [];
  for (const alias of aliasMap.keys()) {
    entryPoints.push({
      in: join(tempDir, `${alias}.js`),
      out: alias,
    });
  }

  await build({
    entryPoints,
    outdir: distClientsDir,
    outbase: tempDir,
    bundle: true,
    splitting: true,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    sourcemap: true,
    entryNames: "[name]",
    chunkNames: "chunks/[name]-[hash]",
    banner: {
      js: 'if (typeof process === "undefined") var process = { env: {} };',
    },
    treeShaking: true,
    logLevel: "info",
    nodePaths: [repoNodeModules],
  });
}

function generateClientTypes(aliasMap) {
  for (const [alias, pkg] of aliasMap.entries()) {
    const dtsPath = join(distClientsDir, `${alias}.d.ts`);
    const contents = `export * from "${pkg}";
declare const _default: typeof import("${pkg}");
export default _default;
`;
    writeFileSync(dtsPath, contents, "utf-8");
  }
}

function generateIndexFiles(aliasMap) {
  const indexLines = [];
  for (const alias of aliasMap.keys()) {
    indexLines.push(`export * as ${alias} from "./clients/${alias}.js";`);
  }

  writeFileSync(join(distDir, "index.js"), `${indexLines.join("\n")}\n`, "utf-8");

  if (existsSync(srcTypesFile)) {
    const typeSource = readFileSync(srcTypesFile, "utf-8");
    writeFileSync(join(distDir, "index.d.ts"), typeSource, "utf-8");
  } else {
    writeFileSync(
      join(distDir, "index.d.ts"),
      `${indexLines.join("\n")}\n`,
      "utf-8",
    );
  }
}

function cleanupTempDir(tempDir) {
  rmSync(tempDir, { recursive: true, force: true });
}

async function main() {
  const aliasMap = loadAliasMap();
  ensureCleanDist();
  const tempDir = createTempEntryFiles(aliasMap);
  try {
    await buildClients(aliasMap, tempDir);
    generateClientTypes(aliasMap);
    generateIndexFiles(aliasMap);
  } finally {
    cleanupTempDir(tempDir);
  }
  console.log(`[awspack] Build completed: ${aliasMap.size} services`);
}

main().catch((error) => {
  console.error("[awspack] Build failed:", error);
  process.exitCode = 1;
});

