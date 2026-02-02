import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from '@beaubrain/chart-lib-react';
import { fn } from '@storybook/test';

const meta: Meta<typeof LineChart> = {
  title: 'Charts/LineChart',
  component: LineChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onChartClick: { action: 'chartClick' },
    onChartHover: { action: 'chartHover' },
    onChartMouseenter: { action: 'chartMouseenter' },
    onChartMouseleave: { action: 'chartMouseleave' },
    onLegendToggle: { action: 'legendToggle' },
    onRendered: { action: 'rendered' },
    onUpdated: { action: 'updated' },
  },
};

export default meta;
type Story = StoryObj<typeof LineChart>;

const generateData = () => {
  const data = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (30 - i));

    data.push({
      date,
      value: 50 + Math.random() * 50,
    });
  }

  return data;
};

export const Basic: Story = {
  args: {
    data: generateData(),
    config: {
      width: 800,
      height: 400,
      margin: { top: 20, right: 20, bottom: 40, left: 60 },
    },
    // 명시적으로 fn() 지정
    onRendered: fn(),
    onUpdated: fn(),
  },
};

export const WithDots: Story = {
  args: {
    data: generateData(),
    config: {
      width: 800,
      height: 400,
      showDots: true,
      dotRadius: 4,
      lineWidth: 2,
    },
    onRendered: fn(),
    onUpdated: fn(),
  },
};

export const AreaFill: Story = {
  args: {
    data: generateData(),
    config: {
      width: 800,
      height: 400,
      showAreaFill: true,
      areaFillOpacity: 0.2,
      lineWidth: 2,
    },
    onRendered: fn(),
    onUpdated: fn(),
  },
};