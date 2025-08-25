module.exports = {
  expo: {
    name: "FlowDo",
    slug: "FlowDo",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/logo1.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/logo1.png",
      resizeMode: "contain",
      backgroundColor: "#f6f8fa",
      dark: {
        image: "./assets/logo1.png",
        backgroundColor: "#222"
      }
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.flowdo.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo1.png",
        backgroundColor: "#f6f8fa"
      },
      edgeToEdgeEnabled: true,
      package: "com.flowdo.app",
      versionCode: 2,
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ],
      allowBackup: false
    },
    web: {
      favicon: "./assets/logo1.png"
    },
    extra: {
      eas: {
        projectId: "503bec3b-0709-446e-bae4-5250be8e4497"
      }
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    plugins: [
      "expo-font",
      "expo-image-picker"
    ],
    scheme: "flowdo"
  }
};
