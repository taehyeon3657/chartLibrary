/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseChart } from '@beaubrain/chart-lib-core';
import { DataProcessor, ScaleManager, EventManager } from '../shared';
import type {
  BarChartConfig,
  ChartDataPoint,
  ProcessedDataPoint
} from '@beaubrain/chart-lib-types';
import { BarChartState } from './BarChartState';
import { CoordinateCalculator } from './CoordinateCalculator';
import { BarChartRenderer } from './renderers/BarChartRenderer';
import * as d3 from 'd3';

export interface RenderContext {
  container: HTMLElement;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>;
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
}

/**
 * BarChart 클래스 - 완전한 반응형 지원
 */
export class BarChart extends BaseChart {
  // 핵심 구성 요소들
  private state: BarChartState;
  private calculator: CoordinateCalculator;
  private renderer: BarChartRenderer;
  private scaleManager: ScaleManager;
  private eventManager: EventManager;

  // 렌더링 컨텍스트
  private renderContext: RenderContext | null = null;

  // 반응형 관련
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeout: NodeJS.Timeout | null = null;

  // 초기 설정 백업 (반응형 계산용)
  private initialConfig: Partial<BarChartConfig>;

  constructor(container: HTMLElement, config: Partial<BarChartConfig> = {}) {
    // 기본 설정
    const defaultConfig: Partial<BarChartConfig> = {
      width: 600,
      height: 400,
      margin: { top: 20, right: 20, bottom: 40, left: 60 },
      orientation: 'vertical',
      barColors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0f', '#8b5cf6'],
      barPadding: 0.1,
      barGroupPadding: 0.2,
      barBorderRadius: 0,
      stacked: false,
      grouped: false,
      showValues: false,
      valuePosition: 'top',
      showXAxis: true,
      showYAxis: true,
      showYAxisZero: false,
      gridLines: true,
      horizontalGridLines: true,
      verticalGridLines: false,
      enableAnimation: false,
      animationDuration: 300,
      animationDelay: 0,
      showTooltip: true,
      showLegend: true,
      legendPosition: 'top',
      responsive: false
    };

    const mergedConfig = { ...defaultConfig, ...config };

    // Title과 Legend가 모두 top일 때 margin.top 자동 증가
    if (mergedConfig.title &&
        (mergedConfig.legendPosition === 'top' || !mergedConfig.legendPosition) &&
        mergedConfig.showLegend !== false) {
      if (!config.margin?.top) {
        mergedConfig.margin = {
          ...mergedConfig.margin!,
          top: 50
        };
      }
    }

    super(container, mergedConfig);

    // 초기 설정 백업 (반응형 계산의 기준)
    this.initialConfig = { ...mergedConfig };

    // 구성 요소들 초기화
    this.state = new BarChartState();
    this.calculator = new CoordinateCalculator(this.state, this.config as BarChartConfig);
    this.renderer = new BarChartRenderer(
      container,
      this.state,
      this.calculator,
      this.config as BarChartConfig
    );

    this.scaleManager = new ScaleManager({
      width: this.config.width!,
      height: this.config.height!,
      margin: this.config.margin!
    });

    this.eventManager = new EventManager({
      enableHover: (this.config as BarChartConfig).showTooltip,
      enableClick: true,
      enableSelection: false,
      enableKeyboard: true
    });

    this.setupEventForwarding();

    // 반응형 설정
    if ((this.config as BarChartConfig).responsive) {
      this.setupResponsive();
    }
  }

  // ============================================
  // 반응형 처리
  // ============================================

  private setupResponsive(): void {
    if (typeof ResizeObserver === 'undefined') {
      console.warn('ResizeObserver is not supported in this browser');
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;

          // 크기가 있을 때만 리사이징 (최소 크기 제한 제거)
          if (width > 0 && height > 0) {
            this.handleResize(width, height);
          }
        }
      }, 100); // 디바운스 100ms
    });

    this.resizeObserver.observe(this.container);
  }

  private handleResize(width: number, height: number): void {
    // 최소 크기를 더 작게 설정 (모바일 대응)
    const minWidth = 200;
    const minHeight = 150;

    const newWidth = Math.max(minWidth, width);
    const newHeight = Math.max(minHeight, height);

    // 완전한 반응형 설정 계산
    const responsiveConfig = this.calculateResponsiveConfig(newWidth, newHeight);

    // 설정 업데이트
    this.updateConfig(responsiveConfig);

    // 차트 다시 렌더링
    if (this.state.isChartRendered()) {
      this.update();
    }
  }

  /**
   * 컨테이너 크기에 따라 모든 설정을 동적으로 계산
   */
  private calculateResponsiveConfig(width: number, height: number): Partial<BarChartConfig> {
    const baseWidth = this.initialConfig.width || 600;
    const baseHeight = this.initialConfig.height || 400;

    // 너비와 높이 비율 계산
    const widthRatio = width / baseWidth;
    const heightRatio = height / baseHeight;

    // 최소 비율 사용 (더 작은 쪽에 맞춤)
    const scale = Math.min(widthRatio, heightRatio);

    // 폰트 계산 (최대 제한 제거, 최소값만 보장)
    const fonts = this.calculateResponsiveFonts(scale);

    // Bar 관련 설정 계산
    const barConfig = this.calculateResponsiveBarConfig(width, height, scale);

    // Margin 계산
    const margin = this.calculateResponsiveMargin(scale);

    return {
      width,
      height,
      margin,
      fonts,
      ...barConfig
    };
  }

  /**
   * 반응형 폰트 크기 계산
   */
  private calculateResponsiveFonts(scale: number) {
    const initialFonts = this.initialConfig.fonts || {};

    // 기본값 정의
    const defaults = {
      xAxisTickFontSize: 10,
      yAxisTickFontSize: 10,
      xAxisLabelFontSize: 16,
      yAxisLabelFontSize: 16,
      legendFontSize: 8,
      titleFontSize: 18,
      valueFontSize: 12,
      valueFontWeight: 100
    };

    // 각 폰트 크기 계산 (최소값만 보장, 최대값 제한 제거)
    return {
      xAxisTickFontSize: Math.max(6, Math.round(Number(initialFonts.xAxisTickFontSize ?? defaults.xAxisTickFontSize) * scale)),
      yAxisTickFontSize: Math.max(6, Math.round(Number(initialFonts.yAxisTickFontSize ?? defaults.yAxisTickFontSize) * scale)),
      xAxisLabelFontSize: Math.max(8, Math.round(Number(initialFonts.xAxisLabelFontSize ?? defaults.xAxisLabelFontSize) * scale)),
      yAxisLabelFontSize: Math.max(8, Math.round(Number(initialFonts.yAxisLabelFontSize ?? defaults.yAxisLabelFontSize) * scale)),
      legendFontSize: Math.max(6, Math.round(Number(initialFonts.legendFontSize ?? defaults.legendFontSize) * scale)),
      titleFontSize: Math.max(10, Math.round(Number(initialFonts.titleFontSize ?? defaults.titleFontSize) * scale)),
      valueFontSize: Math.max(6, Math.round(Number(initialFonts.valueFontSize ?? defaults.valueFontSize) * scale)),
      valueFontWeight: initialFonts.valueFontWeight ?? defaults.valueFontWeight
    };
  }

  /**
   * 반응형 Bar 설정 계산
   */
  private calculateResponsiveBarConfig(width: number, height: number, scale: number) {
    const config = this.initialConfig;
    const orientation = config.orientation || 'vertical';

    // barWidth가 명시적으로 지정된 경우에도 스케일 적용
    let barWidth: number | undefined;
    if (config.barWidth) {
      // 사용자 지정 barWidth를 스케일에 따라 조정
      barWidth = Math.max(2, Math.round(config.barWidth * scale));
    }
    // barWidth를 지정하지 않으면 undefined로 두어 자동 계산되도록 함

    // barBorderRadius도 스케일 적용
    const barBorderRadius = config.barBorderRadius
      ? Math.max(0, Math.round(config.barBorderRadius * scale))
      : 0;

    // barGroupPadding 처리 (문자열일 수 있음)
    let barGroupPadding: number | string | undefined = config.barGroupPadding;
    if (typeof barGroupPadding === 'string' && barGroupPadding.endsWith('px')) {
      const pxValue = parseFloat(barGroupPadding);
      if (!isNaN(pxValue)) {
        barGroupPadding = `${Math.max(1, Math.round(pxValue * scale))}px`;
      }
    } else if (typeof barGroupPadding === 'number') {
      // 숫자인 경우는 비율이므로 그대로 유지
      barGroupPadding = config.barGroupPadding;
    }

    return {
      barWidth,
      barBorderRadius,
      barGroupPadding,
      barPadding: config.barPadding // 비율이므로 그대로 유지
    };
  }

  /**
   * 반응형 Margin 계산
   */
  private calculateResponsiveMargin(scale: number) {
    const initialMargin = this.initialConfig.margin || { top: 20, right: 20, bottom: 40, left: 60 };

    return {
      top: Math.max(10, Math.round(initialMargin.top * scale)),
      right: Math.max(10, Math.round(initialMargin.right * scale)),
      bottom: Math.max(20, Math.round(initialMargin.bottom * scale)),
      left: Math.max(30, Math.round(initialMargin.left * scale))
    };
  }

  // ============================================
  // 공개 API 메서드들
  // ============================================

  public setData(data: ChartDataPoint[]): this {
    const validation = DataProcessor.validateData(data);
    if (!validation.isValid) {
      console.error('Invalid data:', validation.errors);
      return this;
    }

    const processedData = DataProcessor.process(data, {
      sort: (this.config as BarChartConfig).sortBars,
      sortBy: 'x'
    });
    this.state.setData(processedData);
    this.scaleManager.setData(processedData, this.state.getGroups());

    const scales = this.createScales();
    this.state.setScales(scales);
    this.eventManager.updateData(processedData);

    return this;
  }

  public render(): this {
    if (this.state.isEmpty()) {
      console.warn('No data to render');
      return this;
    }

    try {
      this.renderContext = this.renderer.render();
    } catch (error) {
      console.error('Renderer.render() failed:', error);
      throw error;
    }

    this.setupInteractions();
    this.state.setRendered(true);
    this.emit('rendered', { chart: this });

    return this;
  }

  public update(): this {
    if (this.state.isChartRendered() && this.renderContext) {
      const scales = this.createScales();
      this.state.setScales(scales);

      this.renderContext = this.renderer.render();
      this.setupInteractions();

      this.emit('updated', { chart: this });
    }
    return this;
  }

  public toggleGroup(group: string): this {
    const wasVisible = this.state.isGroupVisible(group);
    this.state.toggleGroup(group);

    if (this.renderContext) {
      this.renderer.updateBars(this.renderContext);
      if ((this.config as BarChartConfig).showLegend !== false) {
        this.renderer.updateLegend(this.renderContext);
      }
    }

    this.emit('legendToggle', {
      group,
      visible: !wasVisible,
      originalEvent: new Event('legendToggle')
    });

    return this;
  }

  public updateConfig(newConfig: Partial<BarChartConfig>): this {
    this.config = { ...this.config, ...newConfig };

    this.scaleManager.updateSize({
      width: this.config.width!,
      height: this.config.height!,
      margin: this.config.margin!
    });

    this.calculator = new CoordinateCalculator(this.state, this.config as BarChartConfig);
    this.renderer = new BarChartRenderer(
      this.container,
      this.state,
      this.calculator,
      this.config as BarChartConfig
    );

    return this;
  }

  // ============================================
  // 헬퍼 메서드들
  // ============================================

  public getState(): any {
    return this.state.getSnapshot();
  }

  public getScaleType(): 'time' | 'linear' | 'ordinal' {
    return this.state.getScaleType();
  }

  public findDataAtPosition(x: number, y: number): ProcessedDataPoint | null {
    return this.calculator.findBarAtPosition(x, y);
  }

  public getDataStats(): any {
    return this.state.getDataExtent();
  }

  // ============================================
  // 내부 메서드들
  // ============================================

  private createScales() {
    const config = this.config as BarChartConfig;
    const scaleType = this.state.getScaleType();
    const orientation = config.orientation || 'vertical';
    const isStacked = config.stacked || false;

    const { xDomain, yDomain: rawYDomain } = this.state.getDataExtent(isStacked);

    let [yMin, yMax] = rawYDomain;

    const range = yMax - yMin;
    const padding = range === 0 ? (yMax || 100) * 0.1 : range * 0.05;

    if (yMax > 0) yMax += padding;
    if (yMin < 0) yMin -= padding;

    const baseOptions = {
      yNice: false,
      colorScheme: config.barColors,
      colorDomain: this.state.getGroups(),
      orientation: orientation,
      yAxisTickInterval: config.scale?.yAxisTickInterval,
      yDomain: [yMin, yMax]
    };

    if (scaleType === 'ordinal' || orientation === 'vertical' || orientation === 'horizontal') {
      return this.scaleManager.createOrdinalScales({
        ...baseOptions,
        xDomain: xDomain as unknown as any,
        yDomain: [yMin, yMax] as [number, number]
      });
    } else if (scaleType === 'linear') {
      const visibleData = this.state.getVisibleData();
      const xValues = visibleData.map(d => Number(d.x));
      const xMin = xValues.length ? Math.min(...xValues) : 0;
      const xMax = xValues.length ? Math.max(...xValues) : 100;
      return this.scaleManager.createLinearScales({
        ...baseOptions,
        xDomain: [xMin, xMax],
        yDomain: [yMin, yMax] as [number, number]
      });
    } else {
      const visibleData = this.state.getVisibleData();
      const xValues = visibleData.map(d => new Date(d.x as any).getTime());
      const xMin = xValues.length ? Math.min(...xValues) : Date.now();
      const xMax = xValues.length ? Math.max(...xValues) : Date.now();
      return this.scaleManager.createTimeScales({
        ...baseOptions,
        xDomain: [new Date(xMin), new Date(xMax)],
        yDomain: [yMin, yMax] as [number, number]
      });
    }
  }

  private setupInteractions(): void {
    if (!this.renderContext) return;

    this.eventManager.setup(this.container, this.state.getData());
    this.setupHitTesting();

    if ((this.config as BarChartConfig).showTooltip) {
      this.setupTooltipEvents();
    }

    if ((this.config as BarChartConfig).showLegend !== false) {
      this.setupLegendEvents();
    }
  }

  private setupHitTesting(): void {
    (this.eventManager as any).findDataAtPosition = (event: { clientX: number; clientY: number }) => {
      if (!this.renderContext) return null;

      const rect = this.container.getBoundingClientRect();
      const margin = this.config.margin || { top: 20, right: 20, bottom: 40, left: 60 };
      const x = event.clientX - rect.left - margin.left;
      const y = event.clientY - rect.top - margin.top;

      return this.calculator.findBarAtPosition(x, y);
    };
  }

  private setupTooltipEvents(): void {
    if (!this.renderContext) return;

    const config = this.config as BarChartConfig;
    const tooltip = this.setupTooltip();

    this.renderContext.chartArea.selectAll('.bar')
      .on('mouseenter', (event, d: any) => {
        const data = d.data;
        const tooltipContent = config.customTooltip
          ? config.customTooltip(data)
          : this.createDefaultTooltipContent(data);

        tooltip
          .style('visibility', 'visible')
          .html(tooltipContent);
      })
      .on('mousemove', (event) => {
        const containerBounds = this.container.getBoundingClientRect();
        const tooltipBounds = tooltip.node()?.getBoundingClientRect() || { width: 0, height: 0 };

        const position = this.calculateTooltipPosition(
          event,
          tooltipBounds.width,
          tooltipBounds.height,
          containerBounds
        );

        tooltip
          .style('left', position.x + 'px')
          .style('top', position.y + 'px');
      })
      .on('mouseleave', () => {
        tooltip.style('visibility', 'hidden');
      });
  }

  private setupLegendEvents(): void {
    if (!this.renderContext) return;

    this.renderContext.svg.selectAll('.legend-item')
      .on('click', (event: any) => {
        const group = event.currentTarget.getAttribute('data-group');
        if (group) {
          this.toggleGroup(group);
        }
      });
  }

  private createDefaultTooltipContent(data: ProcessedDataPoint): string {
    const config = this.config as BarChartConfig;

    const categoryStr = String(data.x);
    const valueStr = config.tooltipFormat
      ? d3.format(config.tooltipFormat)(data.y)
      : data.y.toString();

    return `
      <div style="font-weight: bold; margin-bottom: 4px;">${data.group}</div>
      <div>Category: ${categoryStr}</div>
      <div>Value: ${valueStr}</div>
    `;
  }

  private calculateTooltipPosition(
    event: MouseEvent,
    tooltipWidth: number,
    tooltipHeight: number,
    containerBounds: DOMRect
  ): { x: number; y: number } {
    let x = event.clientX + 10;
    let y = event.clientY - 10;

    if (x + tooltipWidth > window.innerWidth) {
      x = event.clientX - tooltipWidth - 10;
    }

    if (y - tooltipHeight < 0) {
      y = event.clientY + 20;
    }

    return { x, y };
  }

  private setupEventForwarding(): void {
    this.eventManager.on('chartHover', (data) => this.emit('chartHover', data));
    this.eventManager.on('chartClick', (data) => this.emit('chartClick', data));
    this.eventManager.on('chartMouseenter', (data) => this.emit('chartMouseenter', data));
    this.eventManager.on('chartMouseleave', (data) => this.emit('chartMouseleave', data));
  }

  public destroy(): void {
    // ResizeObserver 정리
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    this.eventManager.destroy();

    if (this.renderContext) {
      this.renderContext.svg.remove();
      this.renderContext = null;
    }

    this.removeAllListeners();
    this.state.setRendered(false);
  }
}