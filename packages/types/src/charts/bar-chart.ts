/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ChartConfig, FontConfig } from '../base/config';

export interface BarChartConfig extends ChartConfig {
  // 바 방향
  orientation?: 'vertical' | 'horizontal';

  // 바 스타일링
  barColors?: string[];
  barWidth?: number;
  barPadding?: number;
  barGroupPadding?: number | string;
  barBorderRadius?: number;

  // 바 유형
  stacked?: boolean;
  grouped?: boolean;

  // 값 표시
  showValues?: boolean;
  valuePosition?: 'top' | 'middle' | 'bottom' | 'outside';
  valueFormat?: string;
  valueColor?: string;

  // 축 설정
  showXAxis?: boolean;
  showYAxis?: boolean;
  showYAxisZero?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisLabelPosition?: 'center' | 'left' | 'right';
  yAxisLabelPosition?: 'center' | 'top' | 'bottom';
  xAxisTickFormat?: string;
  yAxisTickFormat?: string;

  // 기준선
  showBaseline?: boolean;
  baselineValue?: number;
  baselineColor?: string;
  baselineWidth?: number;
  baselineStyle?: 'solid' | 'dashed';

  // 그리드 라인
  gridLines?: boolean;
  gridLineStyle?: 'solid' | 'dashed';
  gridColor?: string;
  horizontalGridLines?: boolean;
  verticalGridLines?: boolean;

  // 축 색상
  axisColor?: string;

  // 제목
  title?: string | null;
  titlePosition?: 'LEFT' | 'CENTER' | 'RIGHT';
  titleFontSize?: number;

  // 범례
  showLegend?: boolean;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left';

  // 애니메이션
  enableAnimation?: boolean;
  animationDuration?: number;
  animationDelay?: number;

  // 툴팁
  showTooltip?: boolean;
  tooltipFormat?: string;
  customTooltip?: (data: any) => string;

  // 정렬
  sortBars?: boolean;
  sortDirection?: 'asc' | 'desc';

  // 영역 제약 (최소/최대만 제한, 기본 barWidth는 제한 없음)
  minBarWidth?: number;
  maxBarWidth?: number;

  fonts?: FontConfig;
}