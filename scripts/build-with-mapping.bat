@echo off
echo 🚀 Building FlowDo with ProGuard mapping file...

echo 📋 Running pre-build checks...
call npx expo-doctor

echo 🔧 Building production app with mapping file...
call eas build --platform android --profile production-with-mapping --clear-cache

echo ✅ Build completed!
echo 📁 Check the EAS dashboard for your build and mapping file
echo 📝 The mapping.txt file will be in the build artifacts

