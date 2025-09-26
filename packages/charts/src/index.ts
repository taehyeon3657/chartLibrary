// 메인 진입점 - 모든 차트 타입 export
export { LineChart } from './line';
// export { BarChart } from './bar';     // 향후 구현
// export { PieChart } from './pie';     // 향후 구현
// export { AreaChart } from './area';   // 향후 구현

// 공통 기능들
export { 
  DataProcessor, 
  ScaleManager, 
  EventManager, 
  RenderingUtils 
} from './shared';

// 편의 기능 (팩토리 등)
// export { ChartFactory } from './ChartFactory';

// 타입들 re-export
export type {
  LineChartConfig,
  // BarChartConfig,
  // PieChartConfig, 
  // AreaChartConfig,
  ChartDataPoint,
  ProcessedDataPoint,
  AllChartEvents as ChartEvents,
  ChartType
} from '@charts-library/types';

// 공통 타입들
export type { 
  ScaleConfig, 
  ScaleOptions, 
  ChartScales,
  InteractionState, 
  InteractionOptions 
} from './shared';