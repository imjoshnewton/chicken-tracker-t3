const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the project and workspace root
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Force ALL react/react-native imports to resolve to a single copy
//    This prevents duplicate React instances across the monorepo
const reactPath = path.resolve(projectRoot, "node_modules/react");
const reactNativePath = path.resolve(monorepoRoot, "node_modules/react-native");

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force react to always resolve to the mobile app's copy
  if (moduleName === "react" || moduleName === "react/jsx-runtime" || moduleName === "react/jsx-dev-runtime") {
    return context.resolveRequest(
      { ...context, resolveRequest: undefined },
      moduleName === "react" ? reactPath : moduleName.replace("react", reactPath),
      platform
    );
  }
  // Force react-native to the root copy
  if (moduleName === "react-native") {
    return context.resolveRequest(
      { ...context, resolveRequest: undefined },
      reactNativePath,
      platform
    );
  }
  // Default resolution
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(
    { ...context, resolveRequest: undefined },
    moduleName,
    platform
  );
};

module.exports = config;
