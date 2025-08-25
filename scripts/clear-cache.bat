@echo off
echo ========================================
echo Clearing Metro Bundler Cache
echo ========================================
echo.

echo Stopping any running Metro processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im expo.exe >nul 2>&1

echo.
echo Clearing Metro cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Metro cache cleared
) else (
    echo ℹ️  No Metro cache found
)

echo.
echo Clearing Expo cache...
if exist ".expo" (
    rmdir /s /q ".expo"
    echo ✅ Expo cache cleared
) else (
    echo ℹ️  No Expo cache found
)

echo.
echo Clearing React Native cache...
if exist "android" (
    rmdir /s /q "android"
    echo ✅ Android build cache cleared
) else (
    echo ℹ️  No Android build cache found
)

if exist "ios" (
    rmdir /s /q "ios"
    echo ✅ iOS build cache cleared
) else (
    echo ℹ️  No iOS build cache found
)

echo.
echo Clearing npm cache...
call npm cache clean --force

echo.
echo Reinstalling dependencies...
call npm install

echo.
echo ========================================
echo Cache clearing completed!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npx expo start --clear
echo 2. Test the app for any remaining errors
echo 3. If issues persist, try: npm run android
echo.
pause
