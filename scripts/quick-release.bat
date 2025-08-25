@echo off
REM FlowDo App - Quick Release Script for Windows
REM This script handles the complete release process

echo 🚀 FlowDo App - Quick Release Process
echo ======================================

REM Check if EAS CLI is installed
echo 🔧 Checking EAS CLI...
eas --version >nul 2>&1
if errorlevel 1 (
    echo ❌ EAS CLI not found. Installing...
    npm install -g @expo/eas-cli
) else (
    echo ✅ EAS CLI is installed
)

REM Check if logged in to Expo
echo 🔐 Checking Expo login...
eas whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ Not logged in to Expo
    echo Please run: eas login
    pause
    exit /b 1
) else (
    echo ✅ Logged in to Expo
)

REM Check environment variables
echo 🔍 Checking environment variables...
if not exist .env (
    echo ❌ .env file not found!
    pause
    exit /b 1
) else (
    echo ✅ .env file found
)

REM Run dependency check
echo 📦 Checking dependencies...
npx expo install --check

REM Ask user if they want to proceed
echo.
echo 📋 Pre-build checklist:
echo - [x] EAS CLI installed
echo - [x] Logged in to Expo
echo - [x] Environment variables configured
echo - [x] Dependencies checked
echo.
set /p proceed="Do you want to proceed with the production build? (y/n): "

if /i "%proceed%" neq "y" (
    echo ❌ Build cancelled by user
    pause
    exit /b 0
)

REM Build for production
echo.
echo 🏗️ Building for production...
echo This may take 10-15 minutes...
echo.
eas build --platform android --profile production

if errorlevel 1 (
    echo ❌ Build failed!
    echo Check the error messages above
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Build completed successfully!
    echo.
    echo 📱 Next steps:
    echo 1. Go to https://expo.dev/accounts/[your-username]/projects/FlowDo/builds
    echo 2. Download the AAB file
    echo 3. Upload to Google Play Console
    echo 4. Complete store listing information
    echo.
    echo 📚 For detailed instructions, see RELEASE_GUIDE.md
    echo.
)

pause
