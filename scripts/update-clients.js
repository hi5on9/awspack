import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { build } from "esbuild";

const packages = [
    { name: "awspack", dir: "packages/full", bundle: false, dependencyField: "dependencies" },
    { name: "awspack-lite", dir: "packages/lite", bundle: false, dependencyField: "dependencies" },
];

const AWS_CLIENT_PREFIX = "@aws-sdk/client-";

function _readJson(file) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function _convertName(name) {
    return name
        .replace(AWS_CLIENT_PREFIX, "")
        .split("-")
        .map((word, index) => (index === 0 ? word : `${word[0].toUpperCase()}${word.slice(1)}`))
        .join("");
}

async function updateClients() {
    let latestVersion = null;

    // 1. check latest version from npm
    try {
        latestVersion = execSync(`npm view @aws-sdk/client-s3 version`).toString().trim();
        console.log(`[INFO] Latest client version : ${latestVersion}`);
    } catch (error) {
        console.log("[ERROR] ❌ Failed to get version ❌", error);
        return;
    }

    if (!latestVersion) {
        console.log("[INFO] client version is latest");
        return;
    }

    for (const { name, dir, bundle, dependencyField } of packages) {
        const pkgFile = path.join(dir, "package.json");
        const srcDir = path.join(process.cwd(), dir, "src");
        const distDir = path.join(process.cwd(), dir, "dist");
        const indexFile = path.join(srcDir, "index.js");
        const pkg = _readJson(pkgFile);

        const deps = pkg[dependencyField] || {};
        const clients = Object.keys(deps).filter((dep) => dep.startsWith(AWS_CLIENT_PREFIX));
        
        if (clients.length === 0) return;

        // 2. update dependency 
        for (const client of clients) {
            const currentVersion = deps[client];
            if (latestVersion !== currentVersion) {
                deps[client] = latestVersion;
            } else {
                console.log('[INFO] Already latest version');
                return
            }
        }

        console.log(`[INFO] ${name} → ${clients.length} clients`);
        console.log(`[INFO] Updating client version from ${pkg.version} to ${latestVersion}`);
        pkg.version = latestVersion;

        fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);
        console.log("[INFO] package.json updated successfully.");

    }
}

updateClients();
