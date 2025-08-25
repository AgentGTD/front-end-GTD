@echo off
echo ========================================
echo FlowDo App - Quick Test Script
echo ========================================
echo.

echo Checking app configuration...
echo.

REM Check app.json
if exist "app.json" (
    echo ✅ app.json found
) else (
    echo ❌ app.json missing
    pause
    exit /b 1
)

REM Check app.config.production.js
if exist "app.config.production.js" (
    echo ✅ app.config.production.js found
) else (
    echo ❌ app.config.production.js missing
    pause
    exit /b 1
)

REM Check environment template
if exist "env.production.template" (
    echo ✅ env.production.template found
) else (
    echo ❌ env.production.template missing
    pause
    exit /b 1
)

REM Check key assets
if exist "assets\logo1.png" (
    echo ✅ logo1.png found
) else (
    echo ❌ logo1.png missing
    pause
    exit /b 1
)

REM Check package.json
if exist "package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json missing
    pause
    exit /b 1
)

REM Check EAS config
if exist "eas.json" (
    echo ✅ eas.json found
) else (
    echo ❌ eas.json missing
    pause
    exit /b 1
)

REM Check AuthContext for restored functions
echo.
echo Checking AuthContext for restored functions...
findstr /C:"getCurrentToken" "context\AuthContext.js" >nul
if %errorlevel% equ 0 (
    echo ✅ getCurrentToken function found
) else (
    echo ❌ getCurrentToken function missing
    pause
    exit /b 1
)

findstr /C:"reloadUser" "context\AuthContext.js" >nul
if %errorlevel% equ 0 (
    echo ✅ reloadUser function found
) else (
    echo ❌ reloadUser function missing
    pause
    exit /b 1
)

echo.
echo ========================================
echo Configuration check completed!
echo ========================================
echo.

REM Check if .env.production exists
if exist ".env.production" (
    echo ✅ .env.production found
    echo.
    echo Ready to build! Run: ./scripts/build-production.bat
) else (
    echo ⚠️  .env.production not found
    echo.
    echo Please create .env.production from env.production.template
    echo and fill in your production values before building.
    echo.
    echo Example:
    echo copy env.production.template .env.production
    echo.
    echo Then edit .env.production with your actual values.
)

echo.
echo ========================================
echo Quick test completed!
echo ========================================
pause
