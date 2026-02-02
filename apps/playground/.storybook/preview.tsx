import type { Preview } from "@storybook/react";
import { fn } from '@storybook/test';
import "../src/app/globals.css";
import React from "react";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    // 배경색을 라이트 모드로 설정
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onRendered: fn(),
    onUpdated: fn(),
    onChartClick: fn(),
    onChartHover: fn(),
    onChartMouseenter: fn(),
    onChartMouseleave: fn(),
    onLegendToggle: fn(),
  },
};

export default preview;