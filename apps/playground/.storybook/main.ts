import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],

  framework: {
    name: "@storybook/nextjs",
    options: {
      builder: {
        useSWC: true, // SWC 사용
      },
    },
  },

  docs: {
    autodocs: "tag",
  },

  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },

  webpackFinal: async (config) => {
    // 소스맵 비활성화
    config.devtool = false;

    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
        '@beaubrain/chart-lib-react': path.resolve(__dirname, '../../../packages/react/src'),
        '@beaubrain/chart-lib-types': path.resolve(__dirname, '../../../packages/types/src'),
        '@beaubrain/chart-lib-charts': path.resolve(__dirname, '../../../packages/charts/src'),
        '@beaubrain/chart-lib-core': path.resolve(__dirname, '../../../packages/core/src'),
      };

      // 확장자 처리
      config.resolve.extensions = [
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        ...(config.resolve.extensions || []),
      ];
    }

    return config;
  },
};

export default config;