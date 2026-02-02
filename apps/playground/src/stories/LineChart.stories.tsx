import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from '@beaubrain/chart-lib-react';
import { generateTimeSeriesData, generateMultiSeriesData } from '../utils/generateData';

const meta = {
  title: 'Charts/LineChart',
  component: LineChart,
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
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 라인 차트
export const Basic: Story = {
  args: {
    data: generateTimeSeriesData(30, 100, 5),
    config: {
      width: 800,
      height: 400,
      margin: { top: 20, right: 20, bottom: 40, left: 60 },
    },
  },
};

// 멀티 시리즈 차트
export const MultiSeries: Story = {
  args: {
    data: generateMultiSeriesData(30, ['Revenue', 'Profit', 'Expenses']),
    config: {
      width: 800,
      height: 400,
      showLegend: true,
      legendPosition: 'top',
      lineWidth: 2,
      showDots: true,
      dotRadius: 4,
    },
  },
};

// 영역 채우기
export const AreaFill: Story = {
  args: {
    data: generateMultiSeriesData(30, ['Data']),
    config: {
      width: 800,
      height: 400,
      showAreaFill: true,
      areaFillOpacity: 0.2,
      areaGradient: true,
      lineWidth: 2,
    },
  },
};

// 다크 테마
export const DarkTheme: Story = {
  args: {
    data: generateTimeSeriesData(30, 100, 10),
    theme: 'dark',
    config: {
      width: 800,
      height: 400,
      showLegend: true,
    },
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// 애니메이션
export const Animated: Story = {
  args: {
    data: generateTimeSeriesData(30, 100, 15),
    config: {
      width: 800,
      height: 400,
      enableAnimation: true,
      animationDuration: 1000,
      showDots: true,
      dotRadius: 4,
    },
  },
};

// 반응형
export const Responsive: Story = {
  args: {
    data: generateTimeSeriesData(30, 100, 10),
    responsive: true,
    config: {
      showLegend: true,
      lineWidth: 2,
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

// 커스터마이징
export const CustomStyled: Story = {
  args: {
    data: generateMultiSeriesData(30, ['Sales', 'Target']),
    config: {
      width: 800,
      height: 500,
      lineColors: ['#8b5cf6', '#06b6d4'],
      lineWidth: 3,
      showDots: true,
      dotRadius: 6,
      showAreaFill: true,
      areaFillOpacity: 0.15,
      showXAxis: true,
      showYAxis: true,
      gridLines: true,
      gridColor: '#e5e7eb',
      axisColor: '#9ca3af',
      showLegend: true,
      legendPosition: 'top',
      enableAnimation: true,
      animationDuration: 1200,
    },
  },
};