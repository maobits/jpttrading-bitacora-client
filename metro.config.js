const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
    const config = getDefaultConfig(__dirname);

    // Asegura que los archivos JSON y ESM se incluyan correctamente
    config.resolver.assetExts = [...config.resolver.assetExts, "json"];
    config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs", "mjs", "js", "jsx", "ts", "tsx"];

    // Configura módulos de Node.js compatibles con Expo
    config.resolver = {
        ...config.resolver,
        extraNodeModules: {
            ...require("node-libs-expo"),
        },
    };

    return config;
})();
