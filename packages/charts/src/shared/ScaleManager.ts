import * as d3 from 'd3';
import type { ProcessedDataPoint } from '@beaubrain/chart-lib-types';

export interface ScaleConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ScaleOptions {
  // X축 스케일 옵션
  xDomain?: [Date, Date] | [number, number];
  xPadding?: number;
  xScaleType?: 'time' | 'linear' | 'ordinal';

  // Y축 스케일 옵션
  yDomain?: [number, number];
  yPadding?: number;
  yNice?: boolean;

  // Y축 눈금 간격 (새로 추가)
  yAxisTickInterval?: number;

  // 색상 스케일 옵션
  colorScheme?: string[];
  colorDomain?: string[];

  // 차트 방향
  orientation?: 'vertical' | 'horizontal';
}

export interface TimeChartScales {
  xScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  colorScale: d3.ScaleOrdinal<string, string>;
  innerWidth: number;
  innerHeight: number;
  scaleType: 'time';
}

export interface LinearChartScales {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  colorScale: d3.ScaleOrdinal<string, string>;
  innerWidth: number;
  innerHeight: number;
  scaleType: 'linear';
}

export interface OrdinalChartScales {
  xScale: d3.ScaleOrdinal<string, number>;
  yScale: d3.ScaleLinear<number, number>;
  colorScale: d3.ScaleOrdinal<string, string>;
  innerWidth: number;
  innerHeight: number;
  scaleType: 'ordinal';
}

export type ChartScales = TimeChartScales | LinearChartScales | OrdinalChartScales;

export class ScaleManager {
  private config: ScaleConfig;
  private data: ProcessedDataPoint[];
  private groups: string[];

  constructor(config: ScaleConfig) {
    this.config = config;
    this.data = [];
    this.groups = [];
  }

  setData(data: ProcessedDataPoint[], groups: string[]): this {
    this.data = data;
    this.groups = groups;
    return this;
  }

  createTimeScales(options: ScaleOptions = {}): TimeChartScales {
    const innerWidth = this.config.width - this.config.margin.left - this.config.margin.right;
    const innerHeight = this.config.height - this.config.margin.top - this.config.margin.bottom;

    const { xDomain, xPadding = 0 } = options;

    const domain = xDomain ? xDomain as [Date, Date] : this.calculateTimeDomain();

    return {
      xScale: d3.scaleTime()
        .domain(domain)
        .range([xPadding, innerWidth - xPadding]),
      yScale: this.createYScale(options, innerHeight),
      colorScale: this.createColorScale(options),
      innerWidth,
      innerHeight,
      scaleType: 'time'
    };
  }

  createLinearScales(options: ScaleOptions = {}): LinearChartScales {
    const innerWidth = this.config.width - this.config.margin.left - this.config.margin.right;
    const innerHeight = this.config.height - this.config.margin.top - this.config.margin.bottom;

    const { xDomain, xPadding = 0 } = options;

    const domain = xDomain ? xDomain as [number, number] : this.calculateLinearDomain();

    return {
      xScale: d3.scaleLinear()
        .domain(domain)
        .range([xPadding, innerWidth - xPadding]),
      yScale: this.createYScale(options, innerHeight),
      colorScale: this.createColorScale(options),
      innerWidth,
      innerHeight,
      scaleType: 'linear'
    };
  }

  createOrdinalScales(options: ScaleOptions = {}): OrdinalChartScales {
    const innerWidth = this.config.width - this.config.margin.left - this.config.margin.right;
    const innerHeight = this.config.height - this.config.margin.top - this.config.margin.bottom;
    const { orientation = 'vertical' } = options;

    const ordinalDomain = [...new Set(this.data.map(d => String(d.x)))];

    let xScale: d3.ScaleOrdinal<string, number>;
    let yScale: d3.ScaleLinear<number, number>;

    if (orientation === 'horizontal') {
      const bandwidth = innerHeight / ordinalDomain.length;
      xScale = d3.scaleOrdinal<string, number>()
        .domain(ordinalDomain)
        .range(ordinalDomain.map((_, i) => i * bandwidth + bandwidth / 2));

      const { yDomain, yPadding = 0, yNice = true } = options;
      const domain = yDomain || this.calculateYDomain();

      yScale = d3.scaleLinear()
        .domain(domain)
        .range([yPadding, innerWidth - yPadding]);

      if (yNice) yScale.nice();

    } else {
      const bandwidth = innerWidth / ordinalDomain.length;
      xScale = d3.scaleOrdinal<string, number>()
        .domain(ordinalDomain)
        .range(ordinalDomain.map((_, i) => i * bandwidth + bandwidth / 2));

      yScale = this.createYScale(options, innerHeight);
    }

    return {
      xScale,
      yScale,
      colorScale: this.createColorScale(options),
      innerWidth,
      innerHeight,
      scaleType: 'ordinal'
    };
  }

  createScales(options: ScaleOptions = {}): ChartScales {
    const scaleType = options.xScaleType || this.detectScaleType();

    switch (scaleType) {
    case 'time':
      return this.createTimeScales(options);
    case 'linear':
      return this.createLinearScales(options);
    case 'ordinal':
      return this.createOrdinalScales(options);
    default:
      return this.createTimeScales(options);
    }
  }

  private detectScaleType(): 'time' | 'linear' | 'ordinal' {
    if (this.data.length === 0) return 'time';

    const hasValidDates = this.data.some(d =>
      d.parsedDate &&
      !isNaN(d.parsedDate.getTime()) &&
      d.parsedDate.getFullYear() > 1900
    );

    if (hasValidDates) return 'time';

    const hasNumericX = this.data.some(d => typeof d.x === 'number');
    if (hasNumericX) return 'linear';

    return 'ordinal';
  }

  private calculateTimeDomain(): [Date, Date] {
    if (this.data.length === 0) {
      return [new Date(), new Date()];
    }

    const dates = this.data
      .map(d => d.parsedDate)
      .filter(d => d && !isNaN(d.getTime())) as Date[];

    if (dates.length === 0) {
      return [new Date(), new Date()];
    }

    return d3.extent(dates) as [Date, Date];
  }

  private calculateLinearDomain(): [number, number] {
    if (this.data.length === 0) {
      return [0, 1];
    }

    const xValues = this.data.map(d => {
      const xVal = d.x;
      return typeof xVal === 'number' ? xVal : 0;
    });

    return d3.extent(xValues) as [number, number];
  }

  /**
   * Y축 스케일 생성 (세로형 차트 기준: height -> 0)
   * yAxisTickInterval 옵션 지원 추가
   */
  private createYScale(options: ScaleOptions, height: number): d3.ScaleLinear<number, number> {
    const { yDomain, yPadding = 0, yNice = true, yAxisTickInterval } = options;

    let domain = yDomain || this.calculateYDomain();

    // yAxisTickInterval이 지정된 경우, 도메인을 조정
    if (yAxisTickInterval && yAxisTickInterval > 0) {
      const [minVal, maxVal] = domain;

      // 최소값을 interval 단위로 내림
      const adjustedMin = Math.floor(minVal / yAxisTickInterval) * yAxisTickInterval;

      // 최대값을 interval 단위로 올림
      const adjustedMax = Math.ceil(maxVal / yAxisTickInterval) * yAxisTickInterval;

      domain = [adjustedMin, adjustedMax];
    }

    const scale = d3.scaleLinear()
      .domain(domain)
      .range([height - yPadding, yPadding]);

    // yAxisTickInterval이 없을 때만 nice() 적용
    if (yNice && !yAxisTickInterval) {
      scale.nice();
    }

    return scale;
  }

  private createColorScale(options: ScaleOptions): d3.ScaleOrdinal<string, string> {
    const { colorScheme, colorDomain } = options;

    const defaultColors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#6366f1'
    ];

    const domain = colorDomain || this.groups;
    const colors = colorScheme || defaultColors;

    return d3.scaleOrdinal<string>()
      .domain(domain)
      .range(colors);
  }

  private calculateXDomain(): [Date, Date] | [number, number] {
    if (this.data.length === 0) {
      return [new Date(), new Date()];
    }

    const hasValidDates = this.data.some(d => d.parsedDate && !isNaN(d.parsedDate.getTime()));

    if (hasValidDates) {
      const dates = this.data
        .map(d => d.parsedDate)
        .filter(d => d && !isNaN(d.getTime())) as Date[];

      return d3.extent(dates) as [Date, Date];
    }

    const xValues = this.data.map(d => {
      const xVal = d.x;
      return typeof xVal === 'number' ? xVal : 0;
    });

    return d3.extent(xValues) as [number, number];
  }

  private calculateYDomain(): [number, number] {
    if (this.data.length === 0) {
      return [0, 1];
    }

    const yValues = this.data.map(d => d.y);
    const [min, max] = d3.extent(yValues) as [number, number];

    const domainMin = Math.min(0, min);
    const domainMax = Math.max(0, max);

    const padding = (domainMax - domainMin) * 0.05;

    let finalMin = domainMin - padding;
    let finalMax = domainMax + padding;

    if (min >= 0) {
      finalMin = 0;
    }
    if (max <= 0) {
      finalMax = 0;
    }

    return [finalMin, finalMax];
  }

  updateSize(newConfig: ScaleConfig): this {
    this.config = newConfig;
    return this;
  }

  getConfig(): ScaleConfig {
    return { ...this.config };
  }

  static invertScale<T>(
    scale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>,
    pixelValue: number
  ): T {
    return scale.invert(pixelValue) as T;
  }

  static filterDataByDomain<T extends ProcessedDataPoint>(
    data: T[],
    xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>,
    selection: [number, number]
  ): T[] {
    const [start, end] = selection.map(pixel => ScaleManager.invertScale(xScale, pixel));

    return data.filter(d => {
      const xValue = d.parsedDate.getTime();
      return xValue >= (start as number) && xValue <= (end as number);
    });
  }
}