import type { ChartMouseEvents, ChartTouchEvents } from './chart-events';
import type { LegendEvents } from './legend-events';
import type { ZoomEventPayload, SelectionEventPayload, BrushEventPayload, PanEventPayload } from './interaction-events';

// 차트 생명주기 이벤트들
export interface ChartLifecycleEvents {
  rendered: { chart: any };
  updated: { chart: any };
  destroyed: { chart: any };
}

// 모든 차트 이벤트를 통합
export interface ChartEvents extends 
  ChartMouseEvents, 
  ChartTouchEvents, 
  LegendEvents,
  ChartLifecycleEvents {
  
  // 상호작용 이벤트들
  zoom: ZoomEventPayload;
  pan: PanEventPayload;
  selection: SelectionEventPayload;
  brush: BrushEventPayload;
}

// 개별 이벤트들도 export
export * from './chart-events';
export * from './legend-events';
export * from './interaction-events';