import type { FontConfig } from '@beaubrain/chart-lib-types';

/**
 * 폰트 사이즈 헬퍼 유틸리티
 *
 * 통합된 fonts 설정과 기존 개별 설정을 병합하여
 * 최종 폰트 사이즈를 반환합니다.
 */
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

  /**
   * 폰트 사이즈 값을 숫자로 변환
   */
  private static toNumber(value: number | string | undefined, defaultValue: number): number {
    if (value === undefined) return defaultValue;

    if (typeof value === 'number') return value;

    // 문자열인 경우 'px' 제거하고 숫자로 변환
    const numValue = parseFloat(value);
    return isNaN(numValue) ? defaultValue : numValue;
  }

  /**
   * X축 눈금 폰트 사이즈 가져오기
   */
  static getXAxisTickFontSize(fonts?: FontConfig): number {
    return this.toNumber(
      fonts?.xAxisTickFontSize,
      this.DEFAULT_SIZES.xAxisTick
    );
  }

  /**
   * Y축 눈금 폰트 사이즈 가져오기
   */
  static getYAxisTickFontSize(fonts?: FontConfig): number {
    return this.toNumber(
      fonts?.yAxisTickFontSize,
      this.DEFAULT_SIZES.yAxisTick
    );
  }

  /**
   * X축 라벨 폰트 사이즈 가져오기
   */
  static getXAxisLabelFontSize(fonts?: FontConfig): number {
    return this.toNumber(
      fonts?.xAxisLabelFontSize,
      this.DEFAULT_SIZES.xAxisLabel
    );
  }

  /**
   * Y축 라벨 폰트 사이즈 가져오기
   */
  static getYAxisLabelFontSize(fonts?: FontConfig): number {
    return this.toNumber(
      fonts?.yAxisLabelFontSize,
      this.DEFAULT_SIZES.yAxisLabel
    );
  }

  /**
   * 범례 폰트 사이즈 가져오기
   *
   * 우선순위:
   * 1. fonts.legendFontSize
   * 2. legendStyle.fontSize (하위 호환성)
   * 3. 기본값
   */
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

  /**
   * 값 표시 폰트 사이즈 가져오기
   *
   * 우선순위:
   * 1. fonts.valueFontSize
   * 2. valueFontSize (하위 호환성)
   * 3. 기본값
   */
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

  /**
   * 제목 폰트 사이즈 가져오기
   *
   * 우선순위:
   * 1. fonts.titleFontSize
   * 2. titleStyle.fontSize (하위 호환성)
   * 3. 기본값
   */
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

  /**
   * 폰트 사이즈를 CSS 문자열로 변환
   */
  static toCSSValue(value: number | string): string {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  }

  /**
   * 모든 폰트 사이즈 설정을 가져오기 (디버깅/검증용)
   */
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