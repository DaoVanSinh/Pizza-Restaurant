@echo off
echo [PM2] Khoi dong React ADMIN (port 5174)...
cd /d "%~dp0\..\admin"

if not exist "node_modules" (
    echo [PM2] Chua co node_modules - dang chay npm install...
    call npm install
    if errorlevel 1 (
        echo [PM2] LOI: npm install that bai!
        exit /b 1
    )
    echo [PM2] npm install hoan tat.
)

echo [PM2] Dang khoi dong Vite dev server (port 5174)...
call npm run dev -- --port 5174
