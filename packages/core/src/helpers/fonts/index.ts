// packages/core/src/helpers/fonts/index.ts
import type { FontConfig } from '@beaubrain/chart-lib-types';

export class FontSizeHelper {
  private static DEFAULT_SIZES = {
    xAxisTick: 12,
    yAxisTick: 12,
    xAxisLabel: 12,
    yAxisLabel: 12,
    legend: 12,
    value: 11,
    title: 16
  };

  private static DEFAULT_WEIGHTS = {
    legend: 'normal',
    value: 'normal',
    title: 'bold'
  };

  private static toNumber(value: number | string | undefined, defaultValue: number): number {
    if (value === undefined) return defaultValue;
    if (typeof value === 'number') return value;
    const numValue = parseFloat(value);
    return isNaN(numValue) ? defaultValue : numValue;
  }

  static getXAxisTickFontSize(fonts?: FontConfig): number {
    return this.toNumber(fonts?.xAxisTickFontSize, this.DEFAULT_SIZES.xAxisTick);
  }

  static getYAxisTickFontSize(fonts?: FontConfig): number {
    return this.toNumber(fonts?.yAxisTickFontSize, this.DEFAULT_SIZES.yAxisTick);
  }

  static getXAxisLabelFontSize(fonts?: FontConfig): number {
    return this.toNumber(fonts?.xAxisLabelFontSize, this.DEFAULT_SIZES.xAxisLabel);
  }

  static getYAxisLabelFontSize(fonts?: FontConfig): number {
    return this.toNumber(fonts?.yAxisLabelFontSize, this.DEFAULT_SIZES.yAxisLabel);
  }

  static getLegendFontSize(
    fonts?: FontConfig,
    legacyLegendStyle?: { fontSize?: number }
  ): number {
    if (fonts?.legendFontSize !== undefined) {
      return this.toNumber(fonts.legendFontSize, this.DEFAULT_SIZES.legend);
    }
    if (legacyLegendStyle?.fontSize !== undefined) {
      return legacyLegendStyle.fontSize;
    }
    return this.DEFAULT_SIZES.legend;
  }

  static getValueFontSize(
    fonts?: FontConfig,
    legacyValueFontSize?: number
  ): number {
    if (fonts?.valueFontSize !== undefined) {
      return this.toNumber(fonts.valueFontSize, this.DEFAULT_SIZES.value);
    }
    if (legacyValueFontSize !== undefined) {
      return legacyValueFontSize;
    }
    return this.DEFAULT_SIZES.value;
  }


  static getValueFontWeight(
    fonts?: FontConfig,
    legacyValueFontWeight?: number | string
  ): string {
    if (fonts?.valueFontWeight !== undefined) {
      return String(fonts.valueFontWeight);
    }
    if (legacyValueFontWeight !== undefined) {
      return String(legacyValueFontWeight);
    }
    return this.DEFAULT_WEIGHTS.value;
  }

  static getLegendFontWeight(
    fonts?: FontConfig,
    legacyLegendStyle?: { fontWeight?: number | string }
  ): string {
    if (fonts?.lengendFontWeight !== undefined) {
      return String(fonts.lengendFontWeight);
    }
    if (legacyLegendStyle?.fontWeight !== undefined) {
      return String(legacyLegendStyle.fontWeight);
    }
    return this.DEFAULT_WEIGHTS.legend;
  }

  static getTitleFontSize(
    fonts?: FontConfig,
    legacyTitleStyle?: { fontSize?: number | string }
  ): number {
    if (fonts?.titleFontSize !== undefined) {
      return this.toNumber(fonts.titleFontSize, this.DEFAULT_SIZES.title);
    }
    if (legacyTitleStyle?.fontSize !== undefined) {
      return this.toNumber(legacyTitleStyle.fontSize, this.DEFAULT_SIZES.title);
    }
    return this.DEFAULT_SIZES.title;
  }

  static toCSSValue(value: number | string): string {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  }

  static getAllfonts(
    fonts?: FontConfig,
    legacyConfig?: {
      valueFontSize?: number;
      legendStyle?: { fontSize?: number };
      titleStyle?: { fontSize?: number | string };
    }
  ) {
    return {
      xAxisTick: this.getXAxisTickFontSize(fonts),
      yAxisTick: this.getYAxisTickFontSize(fonts),
      xAxisLabel: this.getXAxisLabelFontSize(fonts),
      yAxisLabel: this.getYAxisLabelFontSize(fonts),
      legend: this.getLegendFontSize(fonts, legacyConfig?.legendStyle),
      value: this.getValueFontSize(fonts, legacyConfig?.valueFontSize),
      title: this.getTitleFontSize(fonts, legacyConfig?.titleStyle)
    };
  }
}