const nextConfig = {
  reactStrictMode: true,
  
  // Transpile workspace packages
  transpilePackages: [
    '@charts-library/react',
    '@charts-library/charts', 
    '@charts-library/core',
    '@charts-library/types'
  ],

  // Experimental features
  experimental: {
    // Enable server actions if needed
    serverActions: true,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle D3 and other large libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
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
}

module.exports = nextConfig