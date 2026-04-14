/**
 * PM2-compatible wrapper to run Spring Boot on Windows.
 * PM2 manages this Node process; Node spawns mvnw.cmd spring-boot:run.
 */
const { spawn } = require("child_process");
const path = require("path");

const backendDir = path.resolve(__dirname, "../backend/restaurant-backend");

const proc = spawn("mvnw.cmd spring-boot:run", {
  cwd: backendDir,
  stdio: "inherit",
  shell: true, // required for .cmd files on Windows
  windowsHide: true,
});

proc.on("error", (err) => {
  console.error("[pizza-backend] Failed to start:", err.message);
  process.exit(1);
});

proc.on("close", (code) => {
  console.log(`[pizza-backend] Exited with code ${code}`);
  process.exit(code ?? 1);
});
