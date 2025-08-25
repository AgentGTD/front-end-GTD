# FlowDo App - Google Play Store Release Guide

## Overview
This guide will walk you through the complete process of releasing FlowDo to the Google Play Store, from preparation to post-release monitoring.

## Prerequisites ✅

### 1. Google Play Console Account
- [ ] Google Play Console developer account ($25 one-time fee)
- [ ] App created in Google Play Console
- [ ] Package name: `com.flowdo.app`

### 2. Expo Account
- [ ] Expo account (free)
- [ ] EAS CLI installed and configured
- [ ] Project linked to Expo

### 3. App Assets
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (at least 2, different device sizes)
- [ ] App description and metadata

## Step-by-Step Release Process

### Step 1: Prepare App Configuration

#### 1.1 Verify app.json Configuration
```json
{
  "expo": {
    "name": "FlowDo",
    "slug": "FlowDo",
    "version": "1.0.0",
    "android": {
      "package": "com.flowdo.app",
      "versionCode": 1,
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

#### 1.2 Verify Environment Variables
Ensure `.env` file contains:
```
API_BASE_URL=https://gtd-backend-backend-gtd-h6hi.encr.app
CLOUDINARY_CLOUD_NAME=dl0fl7kvn
CLOUDINARY_UPLOAD_PRESET=FlowDo Mobile App
GOOGLE_ANDROID_CLIENT_ID=348188214999-j0pq442hnf3ttid6k1b7k970e3lf20jr.apps.googleusercontent.com
GOOGLE_WEB_CLIENT_ID=348188214999-si9difv96vltv0no63thdgj2c7ccv8pf.apps.googleusercontent.com
```

### Step 2: Build Production App Bundle

#### 2.1 Install and Configure EAS CLI
```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure EAS Build
eas build:configure
```

#### 2.2 Build for Production
```bash
# Build Android App Bundle (AAB)
eas build --platform android --profile production
```

**Alternative: Use the provided build script**
```bash
# On Windows
scripts\build-production.bat

# On macOS/Linux
chmod +x scripts/build-production.sh
./scripts/build-production.sh
```

#### 2.3 Download the AAB File
- Go to [Expo EAS Dashboard](https://expo.dev/accounts/[your-username]/projects/FlowDo/builds)
- Download the generated AAB file
- The file will be named something like: `FlowDo-1.0.0-1.aab`

### Step 3: Google Play Console Setup

#### 3.1 App Information
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Fill in the following information:

**Store Listing:**
- App title: "FlowDo"
- Short description: "Personal productivity and task management app"
- Full description: [Write a comprehensive description]
- App category: "Productivity"
- Content rating: Complete the questionnaire

#### 3.2 Upload Assets
1. **App icon**: Upload `logo1.png` (512x512 PNG)
2. **Feature graphic**: Create and upload a 1024x500 PNG
3. **Screenshots**: Upload at least 2 screenshots from different device sizes
4. **App video**: Optional but recommended

#### 3.3 Privacy Policy
- Create a privacy policy (required)
- Upload the privacy policy URL
- Complete the Data Safety section
- Justify all app permissions

### Step 4: Upload and Release

#### 4.1 Upload AAB File
1. Go to "Release" → "Production" → "Create new release"
2. Upload the AAB file downloaded from EAS
3. Add release notes (what's new in this version)
4. Save the release

#### 4.2 Testing Tracks (Recommended)
Before going to production, test your app:

1. **Internal Testing**
   - Upload AAB to internal testing track
   - Add testers (up to 100)
   - Test thoroughly

2. **Closed Testing**
   - Upload AAB to closed testing track
   - Add external testers
   - Collect feedback

3. **Open Testing**
   - Optional: Make app available for public testing
   - Get broader feedback

#### 4.3 Production Release
1. Go to "Release" → "Production"
2. Select the saved release
3. Set rollout percentage (start with 10%)
4. Review and roll out

### Step 5: Post-Release Monitoring

#### 5.1 Monitor Performance
- Check Google Play Console analytics
- Monitor crash reports
- Track user engagement

#### 5.2 User Feedback
- Respond to Play Store reviews
- Monitor user feedback
- Plan updates based on feedback

#### 5.3 Analytics Setup (Recommended)
```bash
# Install Firebase Analytics
npx expo install @react-native-firebase/app @react-native-firebase/analytics

# Install Crashlytics for crash reporting
npx expo install @react-native-firebase/crashlytics
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
- Check environment variables
- Verify all dependencies are compatible
- Check Expo SDK version compatibility

#### 2. Google Play Console Rejections
- Ensure privacy policy is complete
- Verify app permissions are justified
- Check content rating questionnaire

#### 3. App Crashes
- Test thoroughly on multiple devices
- Use Firebase Crashlytics for monitoring
- Implement proper error handling

### Version Management

For future updates:
1. Increment `version` in `app.json`
2. Increment `versionCode` in `app.json`
3. Update release notes
4. Build and upload new AAB

Example:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

## Security Checklist

- [x] HTTPS API endpoints
- [x] Environment variables secured
- [x] OAuth properly configured
- [x] User data encrypted
- [x] Privacy policy in place

## Performance Optimization

- [ ] Implement lazy loading
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Implement caching strategies

## Support Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Documentation](https://reactnative.dev/)

## Emergency Contacts

- **Expo Support**: https://expo.canny.io/
- **Google Play Console Support**: https://support.google.com/googleplay/android-developer
- **Firebase Support**: https://firebase.google.com/support

---

**Remember**: Always test thoroughly before releasing to production. Start with a small rollout percentage and gradually increase based on user feedback and stability.
