import type { ChartConfig } from '../base/config';

export interface BarChartConfig extends ChartConfig {
  // 바 방향
  orientation?: 'vertical' | 'horizontal'; // vertical: 세로(위로), horizontal: 가로(오른쪽으로)

  // 바 스타일링
  barColors?: string[];
  barWidth?: number; // px 단위
  barPadding?: number; // 바 사이 간격 (0-1 비율)
  barGroupPadding?: number; // 그룹 간 간격 (0-1 비율)
  barBorderRadius?: number; // 바 모서리 둥글기 (px)

  // 바 유형
  stacked?: boolean; // 쌓기 모드
  grouped?: boolean; // 그룹화 모드 (stacked가 false일 때만)

  // 값 표시
  showValues?: boolean; // 바 위에 값 표시
  valuePosition?: 'top' | 'middle' | 'bottom' | 'outside';
  valueFormat?: string; // d3-format 문자열
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

  // 그리드 라인
  gridLines?: boolean;
  gridLineStyle?: 'solid' | 'dashed';
  gridColor?: string;
  horizontalGridLines?: boolean; // 가로선
  verticalGridLines?: boolean; // 세로선

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