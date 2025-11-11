import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const AWS_CLIENT_PREFIX = "@aws-sdk/client-";
const ROOT_DIR = process.cwd();
const FULL_DIR = path.join(ROOT_DIR, "packages/full");
const LITE_DIR = path.join(ROOT_DIR, "packages/lite");
const FULL_PKG_PATH = path.join(FULL_DIR, "package.json");
const LITE_PKG_PATH = path.join(LITE_DIR, "package.json");
const FULL_SRC_INDEX_JS = path.join(FULL_DIR, "src/index.js");
const FULL_SRC_INDEX_DTS = path.join(FULL_DIR, "src/index.d.ts");

function _readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function _sortObjectKeys(obj) {
  if (!obj) return undefined;
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

function _toAlias(clientName) {
  const raw = clientName.slice(AWS_CLIENT_PREFIX.length);
  return raw
    .split(/-+/)
    .map((segment, index) =>
      index === 0 ? segment : segment.charAt(0).toUpperCase() + segment.slice(1),
    )
    .join("");
}

function _fetchClientMetadata(clientName) {
  const output = JSON.parse(
    execSync(`npm view ${clientName} version deprecated --json`, {
      encoding: "utf8",
    }),
  );
  if (typeof output === "string") {
    return { version: output, deprecated: false };
  }
  return { version: output.version, deprecated: Boolean(output.deprecated) };
}

function updateClients() {
  const fullPkg = _readJson(FULL_PKG_PATH);
  const litePkg = _readJson(LITE_PKG_PATH);

  const fullDevDeps = fullPkg.devDependencies ?? {};
  const liteDevDeps = litePkg.devDependencies ?? {};

  const clients = Object.keys(fullDevDeps)
    .filter((name) => name.startsWith(AWS_CLIENT_PREFIX))
    .sort((a, b) => a.localeCompare(b));

  const aliasEntries = [];
  const seenAlias = new Set();

  let updatedCount = 0;

  let latestVersion =
    typeof fullPkg.version === "string" && fullPkg.version.trim().length > 0
      ? fullPkg.version
      : "0.0.0";

  // 1. check latest version from npm
  for (const clientName of clients) {
    const { version, deprecated } = _fetchClientMetadata(clientName);

    if (fullDevDeps[clientName] !== version) {
      fullDevDeps[clientName] = version;
      updatedCount += 1;
    }

    if (clientName in liteDevDeps) liteDevDeps[clientName] = version;

    const alias = _toAlias(clientName);
    if (seenAlias.has(alias)) {
      throw new Error(`Alias collision detected for "${alias}" (package: ${clientName})`);
    }
    seenAlias.add(alias);
    aliasEntries.push({ alias, name: clientName, deprecated });
    if (
      typeof version === "string" &&
      version.localeCompare(latestVersion, undefined, { numeric: true, sensitivity: "base" }) > 0
    ) {
      latestVersion = version;
    }
  }

  fullPkg.version = latestVersion;
  litePkg.version = latestVersion;
  fullPkg.devDependencies = _sortObjectKeys(fullDevDeps);
  litePkg.devDependencies = _sortObjectKeys(liteDevDeps);

  // 2. regenerate source code (if deprecated add comment)
  const sorted = [...aliasEntries].sort((a, b) => a.alias.localeCompare(b.alias));
  const jsLines = sorted.map(({ alias, name, deprecated }) => {
    const suffix = deprecated ? " // deprecated" : "";
    return `export * as ${alias} from "${name}";${suffix}`;
  });
  const dtsLines = sorted.map(({ alias, name }) => `export * as ${alias} from "${name}";`);

  // 3. write to full index.js and index.d.ts
  fs.writeFileSync(FULL_SRC_INDEX_JS, `${jsLines.join("\n")}\n`);
  fs.writeFileSync(FULL_SRC_INDEX_DTS, `${dtsLines.join("\n")}\n`);

  // 4. write to full package.json and lite package.json
  fs.writeFileSync(FULL_PKG_PATH, `${JSON.stringify(fullPkg, null, 2)}\n`);
  fs.writeFileSync(LITE_PKG_PATH, `${JSON.stringify(litePkg, null, 2)}\n`);

  console.log(`[update-clients] Updated ${updatedCount} package versions`);

  execSync("npm run build --workspace=awspack", { stdio: "inherit" });
  execSync("npm run build --workspace=awspack-lite", { stdio: "inherit" });
}

updateClients();

