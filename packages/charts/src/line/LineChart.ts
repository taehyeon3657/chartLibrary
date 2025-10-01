import { BaseChart } from '@charts-library/core';
import { DataProcessor, ScaleManager, EventManager } from '../shared';
import type { 
  LineChartConfig, 
  ChartDataPoint, 
  ProcessedDataPoint 
} from '@charts-library/types';
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

/**
 * LineChart 클래스
 *
 * - 외부 API 제공
 * - 구성 요소들 간 조정
 * - 이벤트 전달
 * 만을 담당합니다.
 */
export class LineChart extends BaseChart {
  // 핵심 구성 요소들
  private state: LineChartState;
  private calculator: CoordinateCalculator;
  private renderer: LineChartRenderer;
  private scaleManager: ScaleManager;
  private eventManager: EventManager;
  
  // 렌더링 컨텍스트
  private renderContext: RenderContext | null = null;

  constructor(container: HTMLElement, config: Partial<LineChartConfig> = {}) {

     console.log('🏗️ LineChart constructor called');
  console.log('📦 Container:', container);
  console.log('⚙️ Config:', config);
    // 기본 설정
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
      legendPosition: 'top'
    };

    super(container, { ...defaultConfig, ...config });

      console.log('📝 Final config:', this.config);
  console.log('🎯 Container element:', this.container);
    
    // 구성 요소들 초기화
    this.state = new LineChartState();
    console.log('✅ State initialized');

    this.calculator = new CoordinateCalculator(this.state, this.config as LineChartConfig);
     console.log('✅ Calculator initialized');

    this.renderer = new LineChartRenderer(
      container, 
      this.state, 
      this.calculator, 
      this.config as LineChartConfig
    );
     console.log('✅ Renderer initialized:', this.renderer);
    
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

      console.log('✅ LineChart constructor complete');

  }

  // ============================================
  // 공개 API 메서드들 (대폭 단순화됨)
  // ============================================

  public setData(data: ChartDataPoint[]): this {
    // 1. 데이터 유효성 검증
    const validation = DataProcessor.validateData(data);
    if (!validation.isValid) {
      console.error('Invalid data:', validation.errors);
      return this;
    }

    // 2. 데이터 처리 및 상태 업데이트
    const processedData = DataProcessor.process(data, { sort: true, sortBy: 'x' });
    this.state.setData(processedData);

    // 3. 스케일 매니저에 데이터 전달
    this.scaleManager.setData(processedData, this.state.getGroups());

    // 4. 스케일 생성 및 상태에 저장
    const scales = this.createScales();
    this.state.setScales(scales);

    // 5. 이벤트 매니저 업데이트
    this.eventManager.updateData(processedData);

    return this;
  }

  public render(): this {
      console.log('🎨 LineChart.render() called');
  console.log('📊 State isEmpty?', this.state.isEmpty());
  console.log('📦 Container:', this.container);
  console.log('🎭 Renderer:', this.renderer);
    if (this.state.isEmpty()) {
      console.warn('No data to render');
      return this;
    }

      console.log('🚀 Calling renderer.render()...');


    // 렌더링 실행
  try {
    this.renderContext = this.renderer.render();
    console.log('✅ Renderer.render() complete');
    console.log('🖼️ RenderContext:', this.renderContext);
    console.log('📐 SVG:', this.renderContext?.svg);
    console.log('🎨 Container innerHTML:', this.container.innerHTML);
    console.log('🔍 Container has SVG?', this.container.querySelector('svg'));
  } catch (error) {
    console.error('❌ Renderer.render() failed:', error);
    throw error;
  }

    // 상호작용 설정
    this.setupInteractions();

    // 상태 업데이트
    this.state.setRendered(true);
    
    this.emit('rendered', { chart: this });
    return this;
  }

  public update(): this {
    if (this.state.isChartRendered() && this.renderContext) {
      // 스케일 다시 생성
      const scales = this.createScales();
      this.state.setScales(scales);
      
      // 다시 렌더링
      this.renderContext = this.renderer.render();
      this.setupInteractions();
      
      this.emit('updated', { chart: this });
    }
    return this;
  }

  public toggleGroup(group: string): this {
    const wasVisible = this.state.isGroupVisible(group);
    this.state.toggleGroup(group);
    
    // 부분 업데이트 (성능 최적화)
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
    
    // 스케일 매니저 설정 업데이트
    this.scaleManager.updateSize({
      width: this.config.width!,
      height: this.config.height!,
      margin: this.config.margin!
    });

    // 계산기 재생성 (새 설정 반영)
    this.calculator = new CoordinateCalculator(this.state, this.config as LineChartConfig);
    
    // 렌더러 재생성
    this.renderer = new LineChartRenderer(
      this.container, 
      this.state, 
      this.calculator, 
      this.config as LineChartConfig
    );

    return this;
  }

  // ============================================
  // 헬퍼 메서드들 (상태에서 위임받음)
  // ============================================

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

  // ============================================
  // 내부 메서드들
  // ============================================

  private createScales() {
    const scaleType = this.state.getScaleType();
    const options = {
      yNice: true,
      colorScheme: (this.config as LineChartConfig).lineColors,
      colorDomain: this.state.getGroups()
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

    // 1. 이벤트 매니저 설정
    this.eventManager.setup(this.container, this.state.getData());
    this.setupHitTesting();

    // 2. 툴팁 설정
    if ((this.config as LineChartConfig).showTooltip) {
      this.setupTooltipEvents();
    }

    // 3. 범례 클릭 이벤트 설정
    if ((this.config as LineChartConfig).showLegend) {
      this.setupLegendEvents();
    }
  }

  private setupHitTesting(): void {
    // EventManager에 히트 테스트 로직 주입
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
    
    // 점에 툴팁 이벤트 연결
    this.renderContext.chartArea.selectAll('.dot')
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
      .on('click', (event, d: any) => {
        const group = event.currentTarget.getAttribute('data-group');
        if (group) {
          this.toggleGroup(group);
        }
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

  private calculateTooltipPosition(
    event: MouseEvent,
    tooltipWidth: number,
    tooltipHeight: number,
    containerBounds: DOMRect
  ): { x: number; y: number } {
    let x = event.clientX + 10;
    let y = event.clientY - 10;

    // 화면 경계 체크
    if (x + tooltipWidth > window.innerWidth) {
      x = event.clientX - tooltipWidth - 10;
    }
    
    if (y - tooltipHeight < 0) {
      y = event.clientY + 20;
    }

    return { x, y };
  }

  private setupEventForwarding(): void {
    // EventManager의 이벤트를 BaseChart의 이벤트로 전달
    this.eventManager.on('chartHover', (data) => this.emit('chartHover', data));
    this.eventManager.on('chartClick', (data) => this.emit('chartClick', data));
    this.eventManager.on('chartMouseenter', (data) => this.emit('chartMouseenter', data));
    this.eventManager.on('chartMouseleave', (data) => this.emit('chartMouseleave', data));
  }

  public destroy(): void {
    this.eventManager.destroy();
    
    if (this.renderContext) {
      this.renderContext.svg.remove();
      this.renderContext = null;
    }

    this.removeAllListeners();
    this.state.setRendered(false);
  }
}