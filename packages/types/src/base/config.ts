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
}