const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  
  // Transpile workspace packages
  transpilePackages: [
    '@charts-library/react',
    '@charts-library/charts', 
    '@charts-library/core',
    '@charts-library/types'
  ],

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // TypeScript 소스 직접 사용하도록 alias 설정
    config.resolve.alias = {
      ...config.resolve.alias,
      '@charts-library/react': path.resolve(__dirname, '../../packages/react/src/index.tsx'),
      '@charts-library/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    };

    // Handle D3 and other large libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Chart Library Playground',
  },

  // Output configuration
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: [],
  },
};

module.exports = nextConfig;