module.exports = {
  expo: {
    name: "FlowDo",
    slug: "FlowDo",
    version: "1.0.1",
    // Removed orientation, icon, userInterfaceStyle, splash, ios, android, plugins, scheme
    // These are handled by native Android configuration when android/ folder exists
    newArchEnabled: true,
    extra: {
      API_BASE_URL: process.env.API_BASE_URL,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
      eas: {
        projectId: "503bec3b-0709-446e-bae4-5250be8e4497"
      }
    },
    runtimeVersion: {
      policy: "sdkVersion"
    }
  }
};
