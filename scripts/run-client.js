/**
 * PM2-compatible wrapper to run Vite client dev server on Windows.
 */
const { spawn } = require("child_process");
const path = require("path");

const dir = path.resolve(__dirname, "../client");

const proc = spawn("npm run dev", {
  cwd: dir,
  stdio: "inherit",
  shell: true,
  windowsHide: true,
});

proc.on("error", (err) => {
  console.error("[pizza-client] Failed to start:", err.message);
  process.exit(1);
});

proc.on("close", (code) => {
  console.log(`[pizza-client] Exited with code ${code}`);
  process.exit(code ?? 1);
});
