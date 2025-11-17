// Components
export { LineChart } from './LineChart';
export type { LineChartProps, LineChartRef } from './LineChart';

export { BarChart } from './BarChart';
export type { BarChartProps, BarChartRef } from './BarChart';

// Re-export types from @beaubrain/chart-lib-types
export type {
  ChartDataPoint,
  LineChartConfig,
  BarChartConfig,
  ProcessedDataPoint,
  BaseChartConfig,
  ChartType
} from '@beaubrain/chart-lib-types';