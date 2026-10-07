// Launches the Next.js CLI with SWC_NATIVE_BINDING_CACHE pinned to an ABSOLUTE
// path under this project (.swccache). This works around an environment issue
// where @swc/core (pulled in by next-intl) refuses its default cache dir in
// AppData\Local\swc because of its inherited ACL. The dir has its inheritance
// stripped so SWC accepts it. SWC requires an absolute path, hence this wrapper.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
process.env.SWC_NATIVE_BINDING_CACHE = path.join(projectRoot, ".swccache");

const child = spawn("next", process.argv.slice(2), {
  stdio: "inherit",
  shell: true,
  cwd: projectRoot,
  env: process.env,
});
child.on("exit", (code) => process.exit(code ?? 0));
