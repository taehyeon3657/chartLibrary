import type { DataPoint } from '../base/data';

export interface ChartEventPayload {
  data: DataPoint;
  index: number;
  group?: string;
  originalEvent: Event;
}

// 마우스 이벤트들
export interface ChartMouseEvents {
  chartHover: ChartEventPayload;
  chartClick: ChartEventPayload;
  chartMouseenter: ChartEventPayload;
  chartMouseleave: ChartEventPayload;
  chartMousemove: ChartEventPayload;
  chartMousedown: ChartEventPayload;
  chartMouseup: ChartEventPayload;
}

// 터치 이벤트들 (모바일 지원)
export interface ChartTouchEvents {
  chartTouchstart: ChartEventPayload;
  chartTouchmove: ChartEventPayload;
  chartTouchend: ChartEventPayload;
}