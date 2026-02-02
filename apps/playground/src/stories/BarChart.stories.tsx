import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from '@beaubrain/chart-lib-react';
import { fn } from '@storybook/test';

const meta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
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
type Story = StoryObj<typeof BarChart>;

const sampleData = [
  { x: 'Jan', value: 100 },
  { x: 'Feb', value: 80 },
  { x: 'Mar', value: 120 },
  { x: 'Apr', value: 90 },
  { x: 'May', value: 110 },
  { x: 'Jun', value: 95 },
];

export const Basic: Story = {
  args: {
    data: sampleData,
    config: {
      width: 800,
      height: 400,
      margin: { top: 20, right: 20, bottom: 40, left: 60 },
      showValues: true,
      barBorderRadius: 4,
    },
    onRendered: fn(),
    onUpdated: fn(),
  },
};

export const Horizontal: Story = {
  args: {
    data: sampleData,
    config: {
      width: 800,
      height: 400,
      orientation: 'horizontal',
      showValues: true,
      valuePosition: 'outside',
      barBorderRadius: 4,
    },
    onRendered: fn(),
    onUpdated: fn(),
  },
};

export const WithColors: Story = {
  args: {
    data: sampleData,
    config: {
      width: 800,
      height: 400,
      barColors: ['#8b5cf6'],
      showValues: true,
      barBorderRadius: 8,
    },
    onRendered: fn(),
    onUpdated: fn(),
  },
};