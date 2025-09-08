import type { ChartConfig } from '../base/config';

export interface PieChartConfig extends ChartConfig {
  // 파이 차트 기본 설정
  innerRadius?: number;
  outerRadius?: number;
  cornerRadius?: number;
  
  // 라벨 설정
  showLabels?: boolean;
  labelPosition?: 'inside' | 'outside' | 'none';
  labelFormat?: string;
  showLabelLines?: boolean;
  
  // 색상
  colorScheme?: string[];
  
  // 상호작용
  enableHover?: boolean;
  hoverOffset?: number;
  
  // 도넛 차트 지원
  donut?: boolean;
  donutRatio?: number;
}