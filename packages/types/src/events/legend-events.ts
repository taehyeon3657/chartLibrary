export interface LegendEventPayload {
  group: string;
  visible: boolean;
  originalEvent: Event;
}

export interface LegendItem {
  group: string;
  label: string;
  color: string;
  visible: boolean;
}

export interface LegendEvents {
  legendClick: LegendEventPayload;
  legendHover: LegendEventPayload;
  legendToggle: LegendEventPayload;
}