@echo off
echo ========================================
echo  Checador Smart TV - Build Test
echo ========================================
echo.

echo [1/3] Building production app...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [2/3] Starting preview server...
echo.
echo ========================================
echo  App running at: http://localhost:4173
echo  Backend expects: http://localhost:4000
echo ========================================
echo.
echo Press Ctrl+C to stop
echo.

call npm run preview
