/**
 * PM2-compatible wrapper to run Vite admin dev server on Windows.
 */
const { spawn } = require("child_process");
const path = require("path");

const dir = path.resolve(__dirname, "../admin");

const proc = spawn("npm run dev -- --port 5174", {
  cwd: dir,
  stdio: "inherit",
  shell: true,
  windowsHide: true,
});

proc.on("error", (err) => {
  console.error("[pizza-admin] Failed to start:", err.message);
  process.exit(1);
});

proc.on("close", (code) => {
  console.log(`[pizza-admin] Exited with code ${code}`);
  process.exit(code ?? 1);
});
