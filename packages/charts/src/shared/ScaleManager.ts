import * as d3 from 'd3';
import type { ProcessedDataPoint } from '@charts-library/types';

/**
 * 차트 스케일 생성 및 관리를 담당하는 헤드리스 클래스
 * 
 * 주요 기능:
 * - 다양한 스케일 타입 지원 (시간, 선형, 서수 등)
 * - 도메인 자동 계산 및 커스텀 지원
 * - 색상 스케일 관리
 * - 반응형 크기 조정
 */

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
  
  // 색상 스케일 옵션
  colorScheme?: string[];
  colorDomain?: string[];
}

export interface ChartScales {
  xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number> | d3.ScaleOrdinal<string, number>;
  yScale: d3.ScaleLinear<number, number>;
  colorScale: d3.ScaleOrdinal<string, string>;
  innerWidth: number;
  innerHeight: number;
}

export class ScaleManager {
  private config: ScaleConfig;
  private data: ProcessedDataPoint[];
  private groups: string[];

  constructor(config: ScaleConfig) {
    this.config = config;
    this.data = [];
    this.groups = [];
  }

  /**
   * 데이터 설정
   */
  setData(data: ProcessedDataPoint[], groups: string[]): this {
    this.data = data;
    this.groups = groups;
    return this;
  }

  /**
   * 모든 스케일 생성
   */
  createScales(options: ScaleOptions = {}): ChartScales {
    const innerWidth = this.config.width - this.config.margin.left - this.config.margin.right;
    const innerHeight = this.config.height - this.config.margin.top - this.config.margin.bottom;

    return {
      xScale: this.createXScale(options, innerWidth),
      yScale: this.createYScale(options, innerHeight),
      colorScale: this.createColorScale(options),
      innerWidth,
      innerHeight
    };
  }

  /**
   * X축 스케일 생성
   */
  private createXScale(
    options: ScaleOptions, 
    width: number
  ): d3.ScaleTime<number, number> | d3.ScaleLinear<number, number> | d3.ScaleOrdinal<string, number> {
    const { xDomain, xScaleType = 'time', xPadding = 0 } = options;

    // 도메인 계산
    const domain = xDomain || this.calculateXDomain();

    switch (xScaleType) {
      case 'time':
        return d3.scaleTime()
          .domain(domain as [Date, Date])
          .range([xPadding, width - xPadding]);

      case 'linear':
        return d3.scaleLinear()
          .domain(domain as [number, number])
          .range([xPadding, width - xPadding]);

      case 'ordinal':
        const ordinalDomain = this.data.map(d => String(d.x));
        return d3.scaleOrdinal<string, number>()
          .domain([...new Set(ordinalDomain)])
          .range(d3.range(0, width, width / ordinalDomain.length));

      default:
        return d3.scaleTime()
          .domain(domain as [Date, Date])
          .range([xPadding, width - xPadding]);
    }
  }

  /**
   * Y축 스케일 생성
   */
  private createYScale(options: ScaleOptions, height: number): d3.ScaleLinear<number, number> {
    const { yDomain, yPadding = 0, yNice = true } = options;

    // 도메인 계산
    const domain = yDomain || this.calculateYDomain();

    const scale = d3.scaleLinear()
      .domain(domain)
      .range([height - yPadding, yPadding]);

    // nice() 적용 (깔끔한 눈금값)
    if (yNice) {
      scale.nice();
    }

    return scale;
  }

  /**
   * 색상 스케일 생성
   */
  private createColorScale(options: ScaleOptions): d3.ScaleOrdinal<string, string> {
    const { colorScheme, colorDomain } = options;

    // 기본 색상 팔레트
    const defaultColors = [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // yellow
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#f97316', // orange
      '#ec4899', // pink
      '#84cc16', // lime
      '#6366f1'  // indigo
    ];

    const domain = colorDomain || this.groups;
    const colors = colorScheme || defaultColors;

    return d3.scaleOrdinal<string>()
      .domain(domain)
      .range(colors);
  }

  /**
   * X축 도메인 자동 계산
   */
  private calculateXDomain(): [Date, Date] | [number, number] {
    if (this.data.length === 0) {
      return [new Date(), new Date()];
    }

    // 날짜 기반인지 확인
    const hasValidDates = this.data.some(d => d.parsedDate && !isNaN(d.parsedDate.getTime()));

    if (hasValidDates) {
      const dates = this.data
        .map(d => d.parsedDate)
        .filter(d => d && !isNaN(d.getTime())) as Date[];
      
      return d3.extent(dates) as [Date, Date];
    }

    // 숫자 기반
    const xValues = this.data.map(d => {
      const xVal = d.x;
      return typeof xVal === 'number' ? xVal : 0;
    });

    return d3.extent(xValues) as [number, number];
  }

  /**
   * Y축 도메인 자동 계산
   */
  private calculateYDomain(): [number, number] {
    if (this.data.length === 0) {
      return [0, 1];
    }

    const yValues = this.data.map(d => d.y);
    const [min, max] = d3.extent(yValues) as [number, number];

    // 0을 포함하는 도메인 생성 (일반적으로 차트에서 선호)
    const domainMin = Math.min(0, min);
    const domainMax = Math.max(0, max);

    // 약간의 패딩 추가 (5%)
    const padding = (domainMax - domainMin) * 0.05;
    
    return [domainMin - padding, domainMax + padding];
  }

  /**
   * 스케일 업데이트 (크기 변경 시)
   */
  updateSize(newConfig: ScaleConfig): this {
    this.config = newConfig;
    return this;
  }

  /**
   * 현재 설정 정보 반환
   */
  getConfig(): ScaleConfig {
    return { ...this.config };
  }

  /**
   * 유틸리티: 픽셀 값을 데이터 값으로 역변환
   */
  static invertScale<T>(
    scale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>, 
    pixelValue: number
  ): T {
    return scale.invert(pixelValue) as T;
  }

  /**
   * 유틸리티: 브러시/줌 영역에서 데이터 필터링
   */
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