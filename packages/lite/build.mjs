import { build } from "esbuild";
import { mkdirSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outFile = resolve("dist/index.js");

await build({
  entryPoints: ["src/index.js"],
  outfile: outFile,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2020"],
  sourcemap: true,
  banner: {
    js: 'if (typeof process === "undefined") var process = { env: {} };',
  },
});

mkdirSync(dirname(outFile), { recursive: true });
copyFileSync("src/index.d.ts", "dist/index.d.ts");

