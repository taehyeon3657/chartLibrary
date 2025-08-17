//d3.chart에서 기본이 되는 타입 정의
export interface ChartData {
  label: string;
  value: number;
  [key: string]: any;
}

export interface ChartConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  theme?: any;
  animation?: {
    duration: number;
    easing: string;
  };
}

export interface ChartEvents {
  hover: (data: ChartData, event: MouseEvent) => void;
  click: (data: ChartData, event: MouseEvent) => void;
  legendClick: (label: string, event: MouseEvent) => void;
}