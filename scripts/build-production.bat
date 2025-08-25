@echo off
echo ========================================
echo Building FlowDo Production App Bundle
echo ========================================
echo.

REM Check if EAS CLI is installed
echo Checking EAS CLI installation...
eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: EAS CLI is not installed or not in PATH
    echo Please install it with: npm install -g @expo/eas-cli
    pause
    exit /b 1
)

REM Check if logged in to Expo
echo Checking Expo login status...
eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Not logged in to Expo
    echo Please login with: eas login
    pause
    exit /b 1
)

REM Check environment file
if not exist ".env.production" (
    echo WARNING: .env.production file not found
    echo Please create it from env.production.template
    echo.
)

REM Clean previous builds
echo Cleaning previous builds...
if exist "android" rmdir /s /q "android"
if exist "ios" rmdir /s /q "ios"
if exist ".expo" rmdir /s /q ".expo"

REM Install dependencies
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Build production bundle
echo.
echo Building production app bundle...
echo This may take several minutes...
echo.
eas build --platform android --profile production

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed!
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Download the app bundle from the link above
echo 2. Test the app thoroughly on a real device
echo 3. Submit to Google Play Console when ready
echo.
pause
