import type { ExpoConfig } from "@expo/config-types";

// const hostname = process.env.EXPO_PUBLIC_HOSTNAME;
// if (!hostname) throw new Error("HOSTNAME environment variable must be set");

const hostname = "mintgarden.io";
const scheme = "badger";
const bundleIdentifier = `${hostname.split(".").reverse().join(".")}.${scheme}`;

const config = {
  name: `${scheme}-example`,
  slug: `${scheme}-example`,
  owner: "peterferguson",
  version: "1.0.0",
  orientation: "portrait",
  scheme,
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier,
    associatedDomains: [`applinks:${hostname}`, `webcredentials:${hostname}`],
    infoPlist: { UIBackgroundModes: ["fetch", "remote-notification"] },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: bundleIdentifier,
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-build-properties",
      {
        ios: { deploymentTarget: "15.0" },
        android: { compileSdkVersion: 34 },
      },
    ],
  ],
} satisfies ExpoConfig;

export default config;
