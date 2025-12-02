export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: ChartMargin;
}

export interface ChartAnimation {
  duration: number;
  easing: string;
  delay?: number;
}

export interface FontConfig {
  xAxisTickFontSize?: number | string;
  yAxisTickFontSize?: number | string;
  xAxisLabelFontSize?: number | string;
  yAxisLabelFontSize?: number | string;
  legendFontSize?: number | string;
  lengendFontWeight?: number | string;
  legendColor?: string;
  valueFontSize?: number | string;
  valueFontWeight?: number | string;
  valueColor?: string;
  titleFontSize?: number | string;
  titleFontWeight?: number | string;
  titleFontColor?: string;
}

/**
 * 축 표시 세부 설정
 */
export interface AxisDisplayConfig {
  /**
   * 축 라인 표시 여부
   * @default true
   */
  showAxisLine?: boolean;

  /**
   * 축 눈금 라인 표시 여부
   * @default true
   */
  showTicks?: boolean;

  /**
   * 축 눈금 값(텍스트) 표시 여부
   * @default true
   */
  showTickLabels?: boolean;
}

/**
 * 축 스케일 관련 설정
 */
export interface ScaleConfig {
  /**
   * X축 위치
   * - 'center': 기본값, 데이터의 0 지점에 위치
   * - 'bottom': 차트 영역 최하단에 위치 (눈금 숨김, 값만 표시)
   * - 'top': 차트 영역 최상단에 위치 (눈금 숨김, 값만 표시)
   */
  xAxisPosition?: 'center' | 'top' | 'bottom';

  /**
   * Y축 눈금 간격
   * - undefined: 자동 계산 (d3 기본 동작)
   * - number: 지정된 단위로 눈금 생성 (올림/내림 자동 처리)
   *
   * 예시:
   * - 데이터 범위 [-32, 22], yAxisTickInterval: 5
   *   → 눈금: [-35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25]
   * - 데이터 범위 [-32, 22], yAxisTickInterval: 10
   *   → 눈금: [-40, -30, -20, -10, 0, 10, 20, 30]
   */
  yAxisTickInterval?: number;

  /**
   * X축 눈금 간격 (추후 확장용)
   */
  xAxisTickInterval?: number;
}

export interface ChartTheme {
  colors: {
    primary: string[];
    background: string;
    text: string;
    grid: string;
    axis: string;
  };
  fonts: {
    family: string;
    size: {
      small: number;
      medium: number;
      large: number;
    };
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

export interface ChartConfig {
  width: number;
  height: number;
  margin: ChartMargin;
  theme?: ChartTheme;
  animation?: ChartAnimation;
  responsive?: boolean;
  className?: string;
  id?: string;
  fonts?: FontConfig;
  scale?: ScaleConfig;
}