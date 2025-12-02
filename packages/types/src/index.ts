// 기본 타입들
export * from './base';

// 이벤트 타입들
export * from './events';

// 차트별 설정 타입들
export * from './charts';

// 유틸리티 타입들
export * from './utils';

// 편의를 위한 타입 별칭들
export type {
  DataPoint as ChartDataPoint,
  ChartConfig as BaseChartConfig,
  ScaleConfig,
  AxisDisplayConfig
} from './base';

export type {
  ChartEvents as AllChartEvents
} from './events';

// 자주 사용되는 유니온 타입들
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';
export type AxisType = 'linear' | 'time' | 'ordinal' | 'log';
export type InterpolationType = 'linear' | 'monotone' | 'natural' | 'step';