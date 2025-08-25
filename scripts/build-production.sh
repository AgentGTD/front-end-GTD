#!/bin/bash

# FlowDo App - Production Build Script
# This script builds the app for Google Play Store release

echo "🚀 Starting FlowDo Production Build..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI is not installed. Installing..."
    npm install -g @expo/eas-cli
fi

# Check if logged in to Expo
echo "🔐 Checking Expo login status..."
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please run: eas login"
    exit 1
fi

# Check environment variables
echo "🔧 Checking environment variables..."
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Validate required environment variables
source .env
required_vars=("API_BASE_URL" "CLOUDINARY_CLOUD_NAME" "CLOUDINARY_UPLOAD_PRESET" "GOOGLE_ANDROID_CLIENT_ID" "GOOGLE_WEB_CLIENT_ID")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Run pre-build checks
echo "🔍 Running pre-build checks..."
npx expo install --check

# Build for production
echo "🏗️ Building for production..."
eas build --platform android --profile production

echo "✅ Build completed!"
echo "📱 Download the AAB file from the EAS dashboard"
echo "📤 Upload the AAB file to Google Play Console"
