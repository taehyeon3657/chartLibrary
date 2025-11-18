/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ChartConfig } from '../base/config';

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
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  gridLines?: boolean;
  gridColor?: string;
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
}