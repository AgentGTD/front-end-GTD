#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 FlowDo App - Release Validation Check\n');

let allChecksPassed = true;

// Check 1: app.json configuration
console.log('1. Checking app.json configuration...');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const expo = appJson.expo;
  
  const requiredFields = {
    'name': 'FlowDo',
    'slug': 'FlowDo',
    'version': '1.0.0',
    'android.package': 'com.flowdo.app',
    'android.versionCode': 1
  };
  
  for (const [field, expectedValue] of Object.entries(requiredFields)) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], expo);
    if (value !== expectedValue) {
      console.log(`   ❌ ${field}: expected "${expectedValue}", got "${value}"`);
      allChecksPassed = false;
    } else {
      console.log(`   ✅ ${field}: "${value}"`);
    }
  }
  
  // Check permissions
  const requiredPermissions = [
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.CAMERA',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE'
  ];
  
  const permissions = expo.android?.permissions || [];
  for (const permission of requiredPermissions) {
    if (!permissions.includes(permission)) {
      console.log(`   ❌ Missing permission: ${permission}`);
      allChecksPassed = false;
    } else {
      console.log(`   ✅ Permission: ${permission}`);
    }
  }
  
} catch (error) {
  console.log(`   ❌ Error reading app.json: ${error.message}`);
  allChecksPassed = false;
}

// Check 2: Environment variables
console.log('\n2. Checking environment variables...');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});
  
  const requiredEnvVars = [
    'API_BASE_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_UPLOAD_PRESET',
    'GOOGLE_ANDROID_CLIENT_ID',
    'GOOGLE_WEB_CLIENT_ID'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!envVars[envVar]) {
      console.log(`   ❌ Missing: ${envVar}`);
      allChecksPassed = false;
    } else {
      console.log(`   ✅ ${envVar}: ${envVars[envVar].substring(0, 20)}...`);
    }
  }
  
} catch (error) {
  console.log(`   ❌ Error reading .env file: ${error.message}`);
  allChecksPassed = false;
}

// Check 3: Required assets
console.log('\n3. Checking required assets...');
const requiredAssets = [
  'assets/logo1.png'
];

for (const asset of requiredAssets) {
  if (fs.existsSync(asset)) {
    console.log(`   ✅ ${asset}`);
  } else {
    console.log(`   ❌ Missing: ${asset}`);
    allChecksPassed = false;
  }
}

// Check 4: EAS configuration
console.log('\n4. Checking EAS configuration...');
if (fs.existsSync('eas.json')) {
  console.log('   ✅ eas.json exists');
} else {
  console.log('   ❌ Missing: eas.json');
  allChecksPassed = false;
}

// Check 5: Package.json dependencies
console.log('\n5. Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const expoVersion = packageJson.dependencies?.expo;
  
  if (expoVersion && expoVersion.startsWith('53.')) {
    console.log(`   ✅ Expo version: ${expoVersion}`);
  } else {
    console.log(`   ❌ Unexpected Expo version: ${expoVersion}`);
    allChecksPassed = false;
  }
  
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}`);
  allChecksPassed = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('🎉 All checks passed! Your app is ready for release.');
  console.log('\nNext steps:');
  console.log('1. Run: eas build --platform android --profile production');
  console.log('2. Download the AAB file from EAS dashboard');
  console.log('3. Upload to Google Play Console');
  console.log('4. Complete the store listing information');
} else {
  console.log('❌ Some checks failed. Please fix the issues above before releasing.');
  console.log('\nRefer to RELEASE_CHECKLIST.md for detailed requirements.');
}
console.log('='.repeat(50));
