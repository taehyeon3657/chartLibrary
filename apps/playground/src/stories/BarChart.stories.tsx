import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from '@beaubrain/chart-lib-react';
import { generateBarChartData, generateMultiSeriesBarData, generateStackedBarData } from '../utils/generateData';

const meta = {
  title: 'Charts/BarChart',
  component: BarChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    config: {
      control: 'object',
    },
    theme: {
      control: 'select',
      options: ['light', 'dark', 'colorful'],
    },
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 바 차트
export const Basic: Story = {
  args: {
    data: generateBarChartData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], 100, 30),
    config: {
      width: 800,
      height: 400,
      margin: { top: 20, right: 20, bottom: 40, left: 60 },
      showValues: true,
      barBorderRadius: 4,
    },
  },
};

// 그룹화된 바 차트
export const Grouped: Story = {
  args: {
    data: generateMultiSeriesBarData(['Q1', 'Q2', 'Q3', 'Q4'], ['Sales', 'Revenue', 'Profit'], 100, 25),
    config: {
      width: 800,
      height: 400,
      grouped: true,
      showLegend: true,
      legendPosition: 'top',
      showValues: true,
      valuePosition: 'outside',
      barBorderRadius: 3,
    },
  },
};

// 스택 바 차트
export const Stacked: Story = {
  args: {
    data: generateStackedBarData(['Jan', 'Feb', 'Mar', 'Apr'], ['Desktop', 'Mobile', 'Tablet']),
    config: {
      width: 800,
      height: 400,
      stacked: true,
      showLegend: true,
      legendPosition: 'top',
      showValues: true,
      valuePosition: 'middle',
      valueColor: 'white',
    },
  },
};

// 수평 바 차트
export const Horizontal: Story = {
  args: {
    data: generateBarChartData(['Product A', 'Product B', 'Product C'], 100, 25),
    config: {
      width: 800,
      height: 400,
      orientation: 'horizontal',
      barColors: ['#8b5cf6'],
      showValues: true,
      valuePosition: 'outside',
      barBorderRadius: 2,
    },
  },
};

// 커스텀 스타일
export const CustomStyled: Story = {
  args: {
    data: generateMultiSeriesBarData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], ['Sales', 'Target'], 100, 20),
    config: {
      width: 800,
      height: 500,
      grouped: true,
      barColors: ['#8b5cf6', '#06b6d4'],
      barBorderRadius: 6,
      barPadding: 0.2,
      showValues: true,
      valuePosition: 'top',
      showXAxis: true,
      showYAxis: true,
      gridLines: true,
      horizontalGridLines: true,
      verticalGridLines: false,
      gridColor: '#e5e7eb',
      axisColor: '#9ca3af',
      showLegend: true,
      legendPosition: 'top',
      enableAnimation: true,
      animationDuration: 1000,
    },
  },
};

// 다크 테마
export const DarkTheme: Story = {
  args: {
    data: generateBarChartData(['Jan', 'Feb', 'Mar', 'Apr', 'May'], 100, 30),
    theme: 'dark',
    config: {
      width: 800,
      height: 400,
      showValues: true,
      barBorderRadius: 4,
    },
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};