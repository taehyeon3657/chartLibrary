import type { ChartConfig } from '../base/config';

export interface BarChartConfig extends ChartConfig {
  // 바 스타일링
  barColors?: string[];
  barWidth?: number;
  barPadding?: number;
  barGroupPadding?: number;
  
  // 바 유형
  orientation?: 'vertical' | 'horizontal';
  stacked?: boolean;
  grouped?: boolean;
  
  // 값 표시
  showValues?: boolean;
  valuePosition?: 'top' | 'middle' | 'bottom' | 'outside';
  valueFormat?: string;
  
  // 축 설정 (line-chart와 공통)
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  gridLines?: boolean;
  
  // 정렬
  sortBars?: boolean;
  sortDirection?: 'asc' | 'desc';
}