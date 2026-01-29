/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseChart } from '@beaubrain/chart-lib-core';
import { DataProcessor, ScaleManager, EventManager } from '../shared';
import type {
  LineChartConfig,
  ChartDataPoint,
  ProcessedDataPoint
} from '@beaubrain/chart-lib-types';
import { LineChartState } from './LineChartState';
import { CoordinateCalculator } from './CoordinateCalculator';
import { LineChartRenderer } from './renderers/LineChartRenderer';
import * as d3 from 'd3';

export interface RenderContext {
  container: HTMLElement;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>;
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
}

export class LineChart extends BaseChart {
  // 핵심 구성 요소들
  private state: LineChartState;
  private calculator: CoordinateCalculator;
  private renderer: LineChartRenderer;
  private scaleManager: ScaleManager;
  private eventManager: EventManager;

  // 렌더링 컨텍스트
  private renderContext: RenderContext | null = null;

  // 반응형 관련 속성
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeout: NodeJS.Timeout | null = null;
  private initialConfig: Partial<LineChartConfig>;

  // [설정] 요소들이 커질 수 있는 최대 배율 (Visual Scale Cap)
  // 화면이 아무리 커져도 선 두께나 폰트는 1.25배까지만 커짐 (너무 거대해짐 방지)
  private readonly MAX_SCALE = 1.25;

  constructor(container: HTMLElement, config: Partial<LineChartConfig> = {}) {
    const defaultConfig: Partial<LineChartConfig> = {
      width: 600,
      height: 400,
      margin: { top: 20, right: 20, bottom: 40, left: 60 },
      lineColors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
      lineWidth: 2,
      enableCurve: true,
      curveType: 'monotoneX',
      showDots: true,
      dotRadius: 4,
      showAreaFill: false,
      areaFillOpacity: 0.1,
      areaGradient: true,
      showXAxis: true,
      showYAxis: true,
      gridLines: true,
      enableAnimation: false,
      animationDuration: 300,
      showTooltip: true,
      showLegend: true,
      legendPosition: 'top',
      responsive: false
    };

    const mergedConfig = { ...defaultConfig, ...config };

    // Title/Legend Top 여백 자동 보정
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

    // 초기 설정 백업 (비율 계산 기준)
    this.initialConfig = { ...mergedConfig };

    // [중요] 스크롤 방지 설정
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden'; // 무조건 숨김

    this.state = new LineChartState();
    this.calculator = new CoordinateCalculator(this.state, this.config as LineChartConfig);
    this.renderer = new LineChartRenderer(
      container,
      this.state,
      this.calculator,
      this.config as LineChartConfig
    );

    this.scaleManager = new ScaleManager({
      width: this.config.width!,
      height: this.config.height!,
      margin: this.config.margin!
    });

    this.eventManager = new EventManager({
      enableHover: (this.config as LineChartConfig).showTooltip,
      enableClick: true,
      enableSelection: false,
      enableKeyboard: true
    });

    this.setupEventForwarding();

    if ((this.config as LineChartConfig).responsive) {
      this.setupResponsive();
    }
  }

  // ============================================
  // 반응형 처리 로직 (스크롤 없이 Fit 모드)
  // ============================================

  private setupResponsive(): void {
    if (typeof ResizeObserver === 'undefined') {
      console.warn('ResizeObserver is not supported');
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);

      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.handleResize(width, height);
        }
      }

    });

    this.resizeObserver.observe(this.container);
  }

  private handleResize(containerWidth: number, containerHeight: number): void {
    const baseWidth = this.initialConfig.width || 600;


    const rawWidthRatio = containerWidth / baseWidth;


    const clampedScale = Math.min(rawWidthRatio, this.MAX_SCALE);


    const finalChartWidth = containerWidth;

    this.container.style.overflow = 'hidden';

    const targetHeight = this.initialConfig.height ?? containerHeight;

    const responsiveConfig = this.calculateResponsiveConfig(
      clampedScale,
      targetHeight,
      finalChartWidth
    );


    this.updateConfig(responsiveConfig);

    if (this.state.isChartRendered()) {
      this.update();
    }
  }

  private calculateResponsiveConfig(
    scale: number,
    height: number,
    actualChartWidth: number
  ): Partial<LineChartConfig> {

    const fonts = this.calculateResponsiveFonts(scale);
    const margin = this.calculateResponsiveMargin(scale);
    const lineVisuals = this.calculateResponsiveLineVisuals(scale);

    return {
      width: actualChartWidth, // 컨테이너에 딱 맞는 너비
      height,
      margin,
      fonts,
      ...lineVisuals
    };
  }

  /**
   * 선 두께, 점 크기 등 시각적 요소 계산
   */
  private calculateResponsiveLineVisuals(scale: number) {
    const config = this.initialConfig;

    const initialLineWidth = config.lineWidth ?? 2;
    const initialDotRadius = config.dotRadius ?? 4;

    return {
      // 비율에 따라 커지거나 작아짐 (단, scale이 MAX_SCALE로 제한되어 있음)
      lineWidth: Math.max(1, initialLineWidth * scale),
      dotRadius: Math.max(2, initialDotRadius * scale)
    };
  }

  private calculateResponsiveFonts(scale: number) {
    const initialFonts = this.initialConfig.fonts || {};
    const defaults = {
      xAxisTickFontSize: 10,
      yAxisTickFontSize: 10,
      xAxisLabelFontSize: 16,
      yAxisLabelFontSize: 16,
      legendFontSize: 8,
      titleFontSize: 18,
      valueFontSize: 12,
    };

    return {
      xAxisTickFontSize: Math.max(8, Math.round(Number(initialFonts.xAxisTickFontSize ?? defaults.xAxisTickFontSize) * scale)),
      yAxisTickFontSize: Math.max(8, Math.round(Number(initialFonts.yAxisTickFontSize ?? defaults.yAxisTickFontSize) * scale)),
      xAxisLabelFontSize: Math.max(10, Math.round(Number(initialFonts.xAxisLabelFontSize ?? defaults.xAxisLabelFontSize) * scale)),
      yAxisLabelFontSize: Math.max(10, Math.round(Number(initialFonts.yAxisLabelFontSize ?? defaults.yAxisLabelFontSize) * scale)),
      legendFontSize: Math.max(8, Math.round(Number(initialFonts.legendFontSize ?? defaults.legendFontSize) * scale)),
      titleFontSize: Math.max(12, Math.round(Number(initialFonts.titleFontSize ?? defaults.titleFontSize) * scale)),
      valueFontSize: Math.max(8, Math.round(Number(initialFonts.valueFontSize ?? defaults.valueFontSize) * scale)),
    };
  }

  private calculateResponsiveMargin(scale: number) {
    const initialMargin = this.initialConfig.margin || { top: 20, right: 20, bottom: 40, left: 60 };
    return {
      // 마진도 비율에 맞춰 줄어들거나 커짐
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

    const processedData = DataProcessor.process(data, { sort: true, sortBy: 'x' });
    this.state.setData(processedData);
    this.scaleManager.setData(processedData, this.state.getGroups());

    const scales = this.createScales();
    this.state.setScales(scales);
    this.eventManager.updateData(processedData);

    // 데이터가 변경되면 현재 컨테이너 크기에 맞춰 다시 계산
    if ((this.config as LineChartConfig).responsive && this.container.clientWidth > 0) {
      this.handleResize(this.container.clientWidth, this.container.clientHeight);
    }

    return this;
  }

  // ... (이하 render, update, toggleGroup 등 기존 로직 동일)
  public render(): this {
    if (this.state.isEmpty()) {
      console.warn('No data to render');
      return this;
    }

    try {
      this.renderContext = this.renderer.render();
    } catch (error) {
      console.error('❌ Renderer.render() failed:', error);
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
      this.renderer.updateLines(this.renderContext);
      this.renderer.updateDots(this.renderContext);
      this.renderer.updateLegend(this.renderContext);
    }

    this.emit('legendToggle', {
      group,
      visible: !wasVisible,
      originalEvent: new Event('legendToggle')
    });

    return this;
  }

  public updateConfig(newConfig: Partial<LineChartConfig>): this {
    this.config = { ...this.config, ...newConfig };

    this.scaleManager.updateSize({
      width: this.config.width!,
      height: this.config.height!,
      margin: this.config.margin!
    });

    this.calculator = new CoordinateCalculator(this.state, this.config as LineChartConfig);
    this.renderer = new LineChartRenderer(
      this.container,
      this.state,
      this.calculator,
      this.config as LineChartConfig
    );

    return this;
  }

  public getState(): any {
    return this.state.getSnapshot();
  }

  public getScaleType(): 'time' | 'linear' | 'ordinal' {
    return this.state.getScaleType();
  }

  public findDataAtPosition(x: number, y: number): ProcessedDataPoint | null {
    return this.calculator.findDataAtPosition(x, y);
  }

  public getDataStats(): any {
    return this.state.getDataExtent();
  }

  private createScales() {
    const scaleType = this.state.getScaleType();
    const options = {
      yNice: true,
      colorScheme: (this.config as LineChartConfig).lineColors,
      colorDomain: this.state.getGroups(),
      yAxisTickInterval: this.config.scale?.yAxisTickInterval
    };

    switch (scaleType) {
    case 'time':
      return this.scaleManager.createTimeScales(options);
    case 'linear':
      return this.scaleManager.createLinearScales(options);
    case 'ordinal':
      return this.scaleManager.createOrdinalScales(options);
    }
  }

  private setupInteractions(): void {
    if (!this.renderContext) return;
    this.eventManager.setup(this.container, this.state.getData());
    this.setupHitTesting();

    if ((this.config as LineChartConfig).showTooltip) {
      this.setupTooltipEvents();
    }
    if ((this.config as LineChartConfig).showLegend) {
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
      return this.calculator.findDataAtPosition(x, y);
    };
  }

  private setupTooltipEvents(): void {
    if (!this.renderContext) return;
    const config = this.config as LineChartConfig;
    const tooltip = this.setupTooltip();

    this.renderContext.chartArea.selectAll('.dot')
      .on('mouseenter', (event, d: any) => {
        const data = d.data;
        const tooltipContent = config.customTooltip
          ? config.customTooltip(data)
          : this.createDefaultTooltipContent(data);

        tooltip.style('visibility', 'visible').html(tooltipContent);
      })
      .on('mousemove', (event) => {
        const containerBounds = this.container.getBoundingClientRect();
        const tooltipBounds = tooltip.node()?.getBoundingClientRect() || { width: 0, height: 0 };
        const position = this.calculateTooltipPosition(event, tooltipBounds.width, tooltipBounds.height, containerBounds);
        tooltip.style('left', position.x + 'px').style('top', position.y + 'px');
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
        if (group) this.toggleGroup(group);
      });
  }

  private createDefaultTooltipContent(data: ProcessedDataPoint): string {
    const config = this.config as LineChartConfig;
    const dateStr = config.tooltipDateFormat
      ? d3.timeFormat(config.tooltipDateFormat)(data.parsedDate)
      : data.parsedDate.toLocaleDateString();
    const valueStr = config.tooltipValueFormat
      ? d3.format(config.tooltipValueFormat)(data.y)
      : data.y.toString();

    return `
      <div style="font-weight: bold; margin-bottom: 4px;">${data.group}</div>
      <div>Date: ${dateStr}</div>
      <div>Value: ${valueStr}</div>
    `;
  }

  private calculateTooltipPosition(event: MouseEvent, tooltipWidth: number, tooltipHeight: number, containerBounds: DOMRect): { x: number; y: number } {
    let x = event.clientX + 10;
    let y = event.clientY - 10;
    if (x + tooltipWidth > window.innerWidth) x = event.clientX - tooltipWidth - 10;
    if (y - tooltipHeight < 0) y = event.clientY + 20;
    return { x, y };
  }

  private setupEventForwarding(): void {
    this.eventManager.on('chartHover', (data) => this.emit('chartHover', data));
    this.eventManager.on('chartClick', (data) => this.emit('chartClick', data));
    this.eventManager.on('chartMouseenter', (data) => this.emit('chartMouseenter', data));
    this.eventManager.on('chartMouseleave', (data) => this.emit('chartMouseleave', data));
  }

  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
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