import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Set the root directory to prevent Next.js from inferring the wrong workspace root
  outputFileTracingRoot: path.join(__dirname),
  
  // Webpack config for when using --webpack flag
  webpack: (config, { isServer }) => {
    // Ensure modules resolve from admin directory first, then root
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
    ];
    
    return config;
  },
  
  // Turbopack config for when using default (Turbopack) mode
  turbopack: {
    resolveAlias: {
      // Ensure Turbopack resolves from admin directory
    },
  },
};

export default nextConfig;
