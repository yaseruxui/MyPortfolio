// Launches the Next.js CLI with SWC_NATIVE_BINDING_CACHE pinned to a SHORT,
// ACL-clean absolute path under the user's home (.swccache-portfolio).
//
// Two environment issues made @swc/core (pulled in by next-intl) refuse to load
// its native binding on this machine:
//   1. Its default cache dir in AppData\Local\swc is rejected because that
//      location's ACL grants replacement rights to AppContainer/package SIDs.
//   2. A project-local cache dir sits too deep (Downloads\...\portfolio) so the
//      cache lock path (long SID folder + 128-char hash) overran Windows'
//      260-char MAX_PATH and failed with "path not found" (os error 3).
//
// Fix: put the cache under the home dir (short path) and strip ACL inheritance
// so SWC accepts it. SWC requires an absolute path, hence this wrapper.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const cacheDir = path.join(os.homedir(), ".swccache-portfolio");
mkdirSync(cacheDir, { recursive: true });

// Strip inherited ACLs and grant the current user full control so SWC's cache
// security check passes. Best-effort and Windows-only.
if (process.platform === "win32") {
  try {
    spawnSync(
      "icacls",
      [cacheDir, "/inheritance:r", "/grant:r", `${os.userInfo().username}:(OI)(CI)F`],
      { stdio: "ignore", shell: false }
    );
  } catch {
    // ignore — the short path alone is usually enough
  }
}

process.env.SWC_NATIVE_BINDING_CACHE = cacheDir;

const child = spawn("next", process.argv.slice(2), {
  stdio: "inherit",
  shell: true,
  cwd: projectRoot,
  env: process.env,
});
child.on("exit", (code) => process.exit(code ?? 0));
