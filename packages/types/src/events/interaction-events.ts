import type { DataPoint } from '../base/data';

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

export interface BrushEventPayload {
  selection: [[number, number], [number, number]]; // [[x0, y0], [x1, y1]]
  selectedData: DataPoint[];
  originalEvent: Event;
}

export interface PanEventPayload {
  deltaX: number;
  deltaY: number;
  originalEvent: Event;
}