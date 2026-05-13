#!/usr/bin/env node
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const port = process.argv[2] || "8765";

process.chdir(repoRoot);

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(
  npx,
  [
    "browser-sync",
    "start",
    "--server",
    "--port",
    port,
    "--files",
    "*.html, *.css, *.js, data/**/*",
  ],
  { stdio: "inherit", cwd: repoRoot }
);

child.on("close", (code) => process.exit(code ?? 0));
