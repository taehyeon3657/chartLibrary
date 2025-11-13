import type { ChartConfig } from '../base/config';

export interface BarChartConfig extends ChartConfig {
  // 바 방향
  orientation?: 'vertical' | 'horizontal';

  // 바 스타일링
  barColors?: string[];
  barWidth?: number;
  barPadding?: number;
  barGroupPadding?: number;
  barBorderRadius?: number;

  // 바 유형
  stacked?: boolean;
  grouped?: boolean;

  // 값 표시
  showValues?: boolean;
  valuePosition?: 'top' | 'middle' | 'bottom' | 'outside';
  valueFormat?: string;
  valueFontSize?: number;
  valueColor?: string;

  // 축 설정
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisLabelPosition?: 'center' | 'left' | 'right';
  yAxisLabelPosition?: 'center' | 'top' | 'bottom';
  xAxisTickFormat?: string;
  yAxisTickFormat?: string;

  // 기준선 (새로 추가!)
  showBaseline?: boolean;
  baselineValue?: number; // 기본값 0
  baselineColor?: string; // 기본값 '#333'
  baselineWidth?: number; // 기본값 2
  baselineStyle?: 'solid' | 'dashed'; // 기본값 'solid'

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
  titleStyle?: {
    fontSize?: number;
    fontWeight?: string | number;
    color?: string;
  };

  // 범례
  showLegend?: boolean;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left';
  legendStyle?: {
    fontSize?: number;
    spacing?: number;
  };

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

  // 영역 제약
  minBarWidth?: number;
  maxBarWidth?: number;
}