const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Clear cache more aggressively
config.resetCache = true;

// Add resolver configuration for better module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Improve transformer configuration
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config; 