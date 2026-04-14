@echo off
echo [PM2] Khoi dong Spring Boot BACKEND (port 8080)...
cd /d "%~dp0\..\backend\restaurant-backend"

:: Kiem tra Java
where java >nul 2>&1
if errorlevel 1 (
    echo [PM2] LOI: Khong tim thay Java. Vui long cai JDK va them vao PATH.
    exit /b 1
)

:: Kiem tra Maven Wrapper
if not exist "mvnw.cmd" (
    echo [PM2] LOI: Khong tim thay mvnw.cmd trong thu muc backend.
    exit /b 1
)

echo [PM2] Dang build va khoi dong Spring Boot...
call mvnw.cmd spring-boot:run -q
