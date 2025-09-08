import type { ChartConfig } from '../base/config';

export interface AreaChartConfig extends ChartConfig {
  // Area 스타일링
  areaColors?: string[];
  areaOpacity?: number;
  
  // 스택 옵션
  stacked?: boolean;
  stackOffset?: 'none' | 'silhouette' | 'wiggle' | 'expand';
  
  // 경계선
  showBorder?: boolean;
  borderWidth?: number;
  borderColors?: string[];
  
  // 베이스라인
  baseline?: number;
  
  // 그라데이션
  enableGradient?: boolean;
  gradientStops?: Array<{
    offset: number;
    stopColor: string;
    stopOpacity: number;
  }>;
}