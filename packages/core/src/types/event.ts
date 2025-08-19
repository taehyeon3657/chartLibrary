import { BaseChart } from "../charts/BaseChart";
import { DataPoint } from "./base";

export interface ChartEventPayload {
  data: DataPoint;
  index: number;
  group?: string;
  originalEvent: Event;
}

export interface LegendEventPayload {
  group: string;
  visible: boolean;
  originalEvent: Event;
}

export interface ZoomEventPayload {
  scale: number;
  translate: [number, number];
  originalEvent: Event;
}

export interface SelectionEventPayload {
  selectedData: DataPoint[];
  selectedIndices: number[];
  originalEvent: Event;
}

// 기본 차트 이벤트들
export interface ChartEvents {
  // 데이터 포인트 이벤트들
  hover: ChartEventPayload;
  click: ChartEventPayload;
  mouseenter: ChartEventPayload;
  mouseleave: ChartEventPayload;
  
  // 범례 이벤트들
  legendClick: LegendEventPayload;
  legendHover: LegendEventPayload;
  
  // 차트 상호작용 이벤트들
  zoom: ZoomEventPayload;
  pan: ZoomEventPayload;
  selection: SelectionEventPayload;
  
  // 차트 생명주기 이벤트들
  rendered: { chart: BaseChart };
  updated: { chart: BaseChart };
  destroyed: { chart: BaseChart };
}