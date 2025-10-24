import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const AWS_CLIENT_PREFIX = "@aws-sdk/client-";

function _readJson(file) {
    return JSON.parse(fs.readFileSync(file, "utf-8"))
}

const FULL_DIR = "packages/full"
const LITE_DIR = "packages/lite"

function _getPkg(dir) {
    const pkgFile = path.join(dir, "package.json")
    const srcDir = path.join(process.cwd(), dir, "src");
    const indexFile = path.join(srcDir, "index.js");
    const pkg = _readJson(pkgFile)
    const deps = pkg["dependencies"] || {} 
    const clients = Object.keys(deps).filter((dep) => dep.startsWith(AWS_CLIENT_PREFIX));
    return { pkgFile, pkg, deps, clients , srcDir, indexFile}
}

function _setDeprecatedComment(indexFile, client, deprecated) {
    if (!fs.existsSync(indexFile)) return;
    const target = `"${client}";`;
    const lines = fs.readFileSync(indexFile, "utf-8").split("\n");
    let changed = false;

    const updated = lines.map((line) => {
        if (!line.includes(target)) return line;
        const hasDeprecated = /\s\/\/\s*deprecated\s*$/.test(line);
        if (deprecated && !hasDeprecated) {
            changed = true;
            console.log(`[INFO] ${client} is deprecated`);
            return `${line} // deprecated`;
        }
        if (!deprecated && hasDeprecated) {
            changed = true;
            return line.replace(/\s*\/\/\s*deprecated\s*$/, "");
        }
        return line;
    });

    if (changed) {
        fs.writeFileSync(indexFile, updated.join("\n"));
    }
}

async function updateClients() {
    const full = _getPkg(FULL_DIR)
    const lite = _getPkg(LITE_DIR)
    let updateCnt = 0

    for (const client of full.clients) {
        const currentVersion = full.deps[client]
        
        // 1. check latest version from npm
        const clientInfo = JSON.parse(execSync(`npm view ${client} version deprecated --json`, { encoding: 'utf8' }))
        const latestVersion = typeof clientInfo == 'string' ? clientInfo : clientInfo.version
        const isDeprecated = typeof clientInfo == 'string' ? false : !!clientInfo.deprecated
        

        // 2. update dependency (full & lite)
        if (currentVersion !== latestVersion) {
            full.deps[client] = latestVersion
            if (lite.clients.includes(client)) {
                lite.deps[client] = latestVersion
            }
            updateCnt += 1
        } else if (currentVersion == latestVersion && !isDeprecated) continue

        full.pkg.version = latestVersion
        lite.pkg.version = latestVersion

        // 3. if client deprecated add comment to index.js 
        if (isDeprecated) {
            _setDeprecatedComment(full.indexFile, client, isDeprecated);
            if (lite.clients.includes(client)) _setDeprecatedComment(lite.indexFile, client, isDeprecated);
        }

        // 4. write back to package.json
        fs.writeFileSync(full.pkgFile, `${JSON.stringify(full.pkg, null, 2)}\n`);
        fs.writeFileSync(lite.pkgFile, `${JSON.stringify(lite.pkg, null, 2)}\n`);
    }
    console.log(`[INFO] total: ${full.clients.length}, update: ${updateCnt} `)
    console.log(`[INFO] Updating client version to ${full.pkg.version}`);
}

updateClients()
