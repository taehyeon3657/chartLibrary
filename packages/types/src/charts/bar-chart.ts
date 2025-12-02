/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ChartConfig, FontConfig, ScaleConfig, AxisDisplayConfig } from '../base/config';

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
  /**
   * X축 전체 표시 여부 (전체 제어)
   * @default true
   */
  showXAxis?: boolean;

  /**
   * X축 세부 표시 설정
   * - showAxisLine: X축 라인 표시 여부
   * - showTicks: X축 눈금 라인 표시 여부
   * - showTickLabels: X축 눈금 값 표시 여부
   */
  xAxisDisplay?: AxisDisplayConfig;

  /**
   * Y축 전체 표시 여부 (전체 제어)
   * @default true
   */
  showYAxis?: boolean;

  /**
   * Y축 세부 표시 설정
   * - showAxisLine: Y축 라인 표시 여부
   * - showTicks: Y축 눈금 라인 표시 여부
   * - showTickLabels: Y축 눈금 값 표시 여부
   */
  yAxisDisplay?: AxisDisplayConfig;

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

  /**
   * 축 스케일 설정
   * X축 위치, Y축 눈금 간격 등을 제어
   */
  scale?: ScaleConfig;
}