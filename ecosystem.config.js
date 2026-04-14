module.exports = {
  apps: [
    // ─── Spring Boot Backend (port 8080) ───────────────────────────────────────
    // Using Node.js wrapper to bypass PM2 Windows EINVAL issue with .cmd files
    {
      name: "pizza-backend",
      script: "./scripts/run-backend.js",
      exec_mode: "fork",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      max_restarts: 5,       
      restart_delay: 5000,   
    },

    // ─── React Admin Panel (port 5174) ─────────────────────────────────────────
    {
      name: "pizza-admin",
      script: "./scripts/run-admin.js",
      exec_mode: "fork",
      cwd: "./",
      instances: 1,
      autorestart: false,
      watch: false,
    },

    // ─── React Client (port 5173) ──────────────────────────────────────────────
    {
      name: "pizza-client",
      script: "./scripts/run-client.js",
      exec_mode: "fork",
      cwd: "./",
      instances: 1,
      autorestart: false,
      watch: false,
    },
  ],
};
