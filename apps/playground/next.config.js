const path = require('path');

const nextConfig = {
  reactStrictMode: true,

  // Transpile workspace packages
  transpilePackages: [
    '@beaubrain/chart-lib-react',
    '@beaubrain/chart-lib-charts',
    '@beaubrain/chart-lib-core',
    '@beaubrain/chart-lib-types'
  ],

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // TypeScript 소스 직접 사용하도록 alias 설정
    config.resolve.alias = {
      ...config.resolve.alias,
      '@beaubrain/chart-lib-react': path.resolve(__dirname, '../../packages/react/src/index.tsx'),
      '@beaubrain/chart-lib-types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@beaubrain/chart-lib-charts': path.resolve(__dirname, '../../packages/charts/src/index.ts'),
      '@beaubrain/chart-lib-core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
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

  // Vercel 배포 최적화
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },

  // Image optimization
  images: {
    domains: [],
  },
};

module.exports = nextConfig;