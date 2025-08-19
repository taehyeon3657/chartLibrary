import { ChartConfig } from "./base";

 export interface LineChartConfig extends ChartConfig {
  // Line 스타일링
  lineColors?: string[];
  lineWidth?: number;
  enableCurve?: boolean;
  curveType?: string;
  showDots?: boolean;
  dotRadius?: number;
  dotColors?: string[] | null;
  
  // Area fill
  showAreaFill?: boolean;
  areaFillOpacity?: number;
  
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
  
  // 툴팁
  showTooltip?: boolean;
  tooltipDateFormat?: string;
  tooltipValueFormat?: string;
}