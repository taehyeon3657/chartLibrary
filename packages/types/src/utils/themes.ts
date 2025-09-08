import type { ChartTheme } from '../base/config';

// 미리 정의된 테마들
export interface PredefinedThemes {
  light: ChartTheme;
  dark: ChartTheme;
  minimal: ChartTheme;
  colorful: ChartTheme;
}

export interface ThemeVariables {
  // CSS 커스텀 프로퍼티와 매핑
  '--chart-primary-color': string;
  '--chart-background-color': string;
  '--chart-text-color': string;
  '--chart-grid-color': string;
}

export type ThemeMode = 'light' | 'dark' | 'auto';