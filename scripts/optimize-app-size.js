#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 FlowDo App - Size Optimization Analysis\n');

// Check current asset sizes
console.log('📊 Current Asset Sizes:');
const assetsDir = path.join(__dirname, '../assets');
const assets = fs.readdirSync(assetsDir).filter(file => 
  file.match(/\.(png|jpg|jpeg|gif|webp)$/i)
);

let totalAssetSize = 0;
const largeAssets = [];

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset);
  const stats = fs.statSync(filePath);
  const sizeKB = Math.round(stats.size / 1024);
  totalAssetSize += sizeKB;
  
  console.log(`   ${asset}: ${sizeKB}KB`);
  
  if (sizeKB > 100) {
    largeAssets.push({ name: asset, size: sizeKB });
  }
});

console.log(`\n📦 Total Assets Size: ${totalAssetSize}KB`);

if (largeAssets.length > 0) {
  console.log('\n⚠️  Large Assets (Consider Optimization):');
  largeAssets.forEach(asset => {
    console.log(`   ${asset.name}: ${asset.size}KB`);
  });
}

// Check package.json for heavy dependencies
console.log('\n📦 Dependency Analysis:');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const heavyDependencies = [
  'react-native-paper',
  '@gorhom/bottom-sheet',
  'moti',
  'react-native-markdown-display',
  'expo-font',
  'expo-image-picker'
];

console.log('Heavy Dependencies to Monitor:');
heavyDependencies.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  }
});

// Check app.json configuration
console.log('\n⚙️  App Configuration Check:');
const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../app.json'), 'utf8'));

const optimizations = {
  'ProGuard Enabled': appJson.expo.android?.enableProguardInReleaseBuilds || false,
  'Resource Shrinking': appJson.expo.android?.enableShrinkResourcesInReleaseBuilds || false,
  'Backup Disabled': appJson.expo.android?.allowBackup === false,
  'Hermes Enabled': appJson.expo.android?.enableHermes !== false
};

Object.entries(optimizations).forEach(([optimization, enabled]) => {
  console.log(`   ${enabled ? '✅' : '❌'} ${optimization}: ${enabled}`);
});

// Recommendations
console.log('\n🎯 Optimization Recommendations:');

if (largeAssets.length > 0) {
  console.log('\n1. Image Optimization:');
  console.log('   - Convert large PNG files to WebP format');
  console.log('   - Use image compression tools (TinyPNG, ImageOptim)');
  console.log('   - Implement lazy loading for images');
  
  largeAssets.forEach(asset => {
    console.log(`   - Optimize: ${asset.name} (${asset.size}KB)`);
  });
}

console.log('\n2. Code Optimization:');
console.log('   - Use tree-shaking friendly imports');
console.log('   - Remove unused dependencies');
console.log('   - Implement code splitting for heavy components');

console.log('\n3. Bundle Optimization:');
console.log('   - Enable Hermes engine (if not already enabled)');
console.log('   - Use ProGuard for code obfuscation and size reduction');
console.log('   - Implement resource shrinking');

// Size estimation
const estimatedSize = Math.round(totalAssetSize * 0.3 + 25000); // Rough estimation
console.log(`\n📱 Estimated Production App Size: ~${estimatedSize}KB (~${Math.round(estimatedSize/1024)}MB)`);

if (estimatedSize > 30000) {
  console.log('⚠️  App size is above 30MB target. Consider optimizations above.');
} else {
  console.log('✅ App size is within target range!');
}

console.log('\n🚀 Quick Optimization Commands:');
console.log('1. Convert images to WebP:');
console.log('   npm install -g imagemin-cli imagemin-webp');
console.log('   imagemin assets/*.png --out-dir=assets/optimized');

console.log('\n2. Analyze bundle:');
console.log('   npx expo export --platform android --analyze');

console.log('\n3. Build with optimizations:');
console.log('   eas build --platform android --profile production --clear-cache');

console.log('\n' + '='.repeat(60));
