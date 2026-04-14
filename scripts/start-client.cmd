@echo off
echo [PM2] Khoi dong React CLIENT (port 5173)...
cd /d "%~dp0\..\client"

if not exist "node_modules" (
    echo [PM2] Chua co node_modules - dang chay npm install...
    call npm install
    if errorlevel 1 (
        echo [PM2] LOI: npm install that bai!
        exit /b 1
    )
    echo [PM2] npm install hoan tat.
)

echo [PM2] Dang khoi dong Vite dev server...
call npm run dev
