const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add pdf to asset extensions so require('./assets/sample.pdf') works
config.resolver.assetExts.push('pdf');

module.exports = config;
