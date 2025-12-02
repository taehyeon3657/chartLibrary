/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ChartConfig, FontConfig, ScaleConfig, AxisDisplayConfig } from '../base/config';

export interface LineChartConfig extends ChartConfig {
  // Line 스타일링
  lineColors?: string[];
  lineWidth?: number;
  enableCurve?: boolean;
  curveType?: 'linear' | 'monotoneX' | 'monotoneY' | 'natural' | 'step' | 'stepBefore' | 'stepAfter';
  showDots?: boolean;
  dotRadius?: number;
  dotColors?: string[] | null;

  // Area fill
  showAreaFill?: boolean;
  areaFillOpacity?: number;
  areaGradient?: boolean;

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

  xAxisLabel?: string;
  yAxisLabel?: string;
  gridLines?: boolean;
  gridColor?: string;
  axisColor?: string;

  // 제목
  title?: string | null;
  titlePosition?: 'LEFT' | 'CENTER' | 'RIGHT';

  // 범례
  showLegend?: boolean;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left';

  // 트렌드 연장선
  showTrendExtension?: boolean;
  trendExtensionLength?: number;
  trendExtensionOpacity?: number;
  trendAnalysisPoints?: number;

  // 포맷터
  xAxisTickFormat?: string;
  yAxisTickFormat?: string;

  enableAnimation?: boolean;
  animationDuration?: number;

  // 툴팁
  showTooltip?: boolean;
  tooltipDateFormat?: string;
  tooltipValueFormat?: string;
  customTooltip?: (data: any) => string;

  // 상호작용
  enableZoom?: boolean;
  enablePan?: boolean;
  enableBrush?: boolean;
  crosshair?: boolean;

  fonts?: FontConfig;

  /**
   * 축 스케일 설정
   * X축 위치, Y축 눈금 간격 등을 제어
   */
  scale?: ScaleConfig;
}