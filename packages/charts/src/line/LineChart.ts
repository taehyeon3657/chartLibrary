import * as d3 from 'd3';
import { BaseChart } from '@charts-library/core';
import { 
  DataProcessor, 
  ScaleManager, 
  EventManager, 
  RenderingUtils,
  type ChartScales,
  type InteractionOptions 
} from '../shared';
import type { 
  LineChartConfig, 
  ChartDataPoint, 
  ProcessedDataPoint,
} from '@charts-library/types';

/**
 * Headless Line Chart 클래스
 * 
 * 핵심 철학:
 * - 비즈니스 로직과 렌더링 로직 분리
 * - 다양한 렌더러 지원 (SVG, Canvas, WebGL 등)
 * - 상태 관리와 이벤트 처리의 추상화
 * - 높은 커스터마이징 가능성
 */

export interface LineChartState {
  data: ProcessedDataPoint[];
  groupedData: Map<string, ProcessedDataPoint[]>;
  groups: string[];
  scales: ChartScales | null;
  scaleType: 'time' | 'linear' | 'ordinal';
  isRendered: boolean;
  visibleGroups: Set<string>;
}

export interface RenderContext {
  container: HTMLElement;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>;
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
}

export class LineChart extends BaseChart {
  // Headless 핵심 구성 요소들
  private dataProcessor: DataProcessor;
  private scaleManager: ScaleManager;
  private eventManager: EventManager;
  
  // 상태 관리
  private state: LineChartState;
  
  // 렌더링 컨텍스트 (필요시에만 생성)
  private renderContext: RenderContext | null = null;

  constructor(container: HTMLElement, config: Partial<LineChartConfig> = {}) {
    // 기본 설정과 사용자 설정 병합
    const defaultConfig: Partial<LineChartConfig> = {
      // 기본 차트 설정
      width: 600,
      height: 400,
      margin: { top: 20, right: 20, bottom: 40, left: 60 },
      
      // 라인 스타일
      lineColors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
      lineWidth: 2,
      enableCurve: true,
      curveType: 'monotoneX',
      
      // 점 설정
      showDots: true,
      dotRadius: 4,
      dotColors: null,
      
      // 영역 설정
      showAreaFill: false,
      areaFillOpacity: 0.1,
      areaGradient: true,
      
      // 축 설정
      showXAxis: true,
      showYAxis: true,
      gridLines: true,
      
      // 애니메이션
      enableAnimation: false,
      animationDuration: 300,
      
      // 상호작용
      showTooltip: true,
      showLegend: true,
      legendPosition: 'top'
    };

    super(container, { ...defaultConfig, ...config });
    
    // 상태 초기화
    this.state = {
      data: [],
      groupedData: new Map(),
      groups: [],
      scales: null,
      scaleType: 'time', // 기본값
      isRendered: false,
      visibleGroups: new Set()
    };

    // 헤드리스 구성 요소 초기화
    this.dataProcessor = new DataProcessor();
    this.scaleManager = new ScaleManager({
      width: this.config.width,
      height: this.config.height,
      margin: this.config.margin
    });
    
    const interactionOptions: InteractionOptions = {
      enableHover: (this.config as LineChartConfig).showTooltip,
      enableClick: true,
      enableSelection: false,
      enableKeyboard: true
    };
    this.eventManager = new EventManager(interactionOptions);

    // 이벤트 전달 설정
    this.setupEventForwarding();
  }

   /**
   * 스케일 타입 자동 감지 (기존 ScaleManager의 로직 활용)
   */
  private detectScaleType(): 'time' | 'linear' | 'ordinal' {
    if (this.state.data.length === 0) return 'time';

    const hasValidDates = this.state.data.some(d => 
      d.parsedDate && 
      !isNaN(d.parsedDate.getTime()) && 
      d.parsedDate.getFullYear() > 1900
    );

    if (hasValidDates) return 'time';

    const hasNumericX = this.state.data.some(d => typeof d.x === 'number');
    if (hasNumericX) return 'linear';

    return 'ordinal';
  }

  /**
   * 데이터 설정 (Headless 메서드)
   */
  public setData(data: ChartDataPoint[]): this {
    // 1. 데이터 유효성 검증
    const validation = DataProcessor.validateData(data);
    if (!validation.isValid) {
      console.error('Invalid data:', validation.errors);
      return this;
    }

    if (validation.warnings.length > 0) {
      console.warn('Data warnings:', validation.warnings);
    }

    // 2. 데이터 처리
    this.state.data = DataProcessor.process(data, {
      sort: true,
      sortBy: 'x'
    });

    // 3. 그룹별 분류
    this.state.groupedData = DataProcessor.groupByCategory(this.state.data);
    this.state.groups = Array.from(this.state.groupedData.keys());
    this.state.visibleGroups = new Set(this.state.groups);

    // 스케일 타입 자동 감지 및 업데이트
    this.state.scaleType = this.detectScaleType();

    // 4. 스케일 관리자에 데이터 전달
    this.scaleManager.setData(this.state.data, this.state.groups);

    // 5. 이벤트 관리자에 데이터 전달
    this.eventManager.updateData(this.state.data);

    return this;
  }

  /**
   * 스케일 생성 - 타입에 따라 적절한 메서드 호출
   */
  public createScales(): ChartScales {
    const config = this.config as LineChartConfig;
    const options = {
      yNice: true,
      colorScheme: config.lineColors,
      colorDomain: this.state.groups
    };

    // 스케일 타입에 따라 적절한 메서드 호출
    switch (this.state.scaleType) {
      case 'time':
        this.state.scales = this.scaleManager.createTimeScales(options);
        break;
      case 'linear':
        this.state.scales = this.scaleManager.createLinearScales(options);
        break;
      case 'ordinal':
        this.state.scales = this.scaleManager.createOrdinalScales(options);
        break;
    }

    return this.state.scales!;
  }

    /**
   * 스케일 타입에 따른 X 좌표 계산 헬퍼
   */
  private getXCoordinate = (d: ProcessedDataPoint): number => {
    if (!this.state.scales) return 0;
    
    const { xScale } = this.state.scales;
    
    switch (this.state.scaleType) {
      case 'time':
        return (xScale as any)(d.parsedDate);
      case 'linear':
        return (xScale as any)(d.x as number);
      case 'ordinal':
        return (xScale as any)(String(d.x));
      default:
        return 0;
    }
  };

/**
   * 라인 경로 계산
   */
  public calculateLinePaths(): Map<string, string> {
    if (!this.state.scales) {
      this.createScales();
    }

    const config = this.config as LineChartConfig;
    const { yScale } = this.state.scales!;
    
    const curveFactory = config.enableCurve 
      ? RenderingUtils.getCurveFactory(config.curveType || 'monotoneX')
      : d3.curveLinear;

    const line = d3.line<ProcessedDataPoint>()
      .x(this.getXCoordinate)
      .y(d => yScale(d.y))
      .curve(curveFactory);

    const paths = new Map<string, string>();

    this.state.groups.forEach(group => {
      if (!this.state.visibleGroups.has(group)) return;
      
      const groupData = this.state.groupedData.get(group) || [];
      if (groupData.length === 0) return;

      const pathString = line(groupData);
      if (pathString) {
        paths.set(group, pathString);
      }
    });

    return paths;
  }

 /**
   * 영역 경로 계산
   */
  public calculateAreaPaths(): Map<string, string> {
    if (!this.state.scales) {
      this.createScales();
    }

    const config = this.config as LineChartConfig;
    const { yScale } = this.state.scales!;
    
    const curveFactory = config.enableCurve 
      ? RenderingUtils.getCurveFactory(config.curveType || 'monotoneX')
      : d3.curveLinear;

    const area = d3.area<ProcessedDataPoint>()
      .x(this.getXCoordinate)
      .y0(yScale(0))
      .y1(d => yScale(d.y))
      .curve(curveFactory);

    const paths = new Map<string, string>();

    this.state.groups.forEach(group => {
      if (!this.state.visibleGroups.has(group)) return;
      
      const groupData = this.state.groupedData.get(group) || [];
      if (groupData.length === 0) return;

      const pathString = area(groupData);
      if (pathString) {
        paths.set(group, pathString);
      }
    });

    return paths;
  }

   /**
   * 점 좌표 계산
   */
  public calculateDotPositions(): Map<string, Array<{x: number, y: number, data: ProcessedDataPoint}>> {
    if (!this.state.scales) {
      this.createScales();
    }

    const { yScale } = this.state.scales!;
    const positions = new Map<string, Array<{x: number, y: number, data: ProcessedDataPoint}>>();

    this.state.groups.forEach(group => {
      if (!this.state.visibleGroups.has(group)) return;
      
      const groupData = this.state.groupedData.get(group) || [];
      const groupPositions = groupData.map(d => ({
        x: this.getXCoordinate(d),
        y: yScale(d.y),
        data: d
      }));

      positions.set(group, groupPositions);
    });

    return positions;
  }

/**
   * 축 설정 계산
   */
  public calculateAxes(): {
    xAxis: d3.Axis<any>;
    yAxis: d3.Axis<d3.NumberValue>;
  } {
    if (!this.state.scales) {
      this.createScales();
    }

    const { xScale, yScale } = this.state.scales!;
    const config = this.config as LineChartConfig;

    let xAxis: d3.Axis<any>;

 switch (this.state.scaleType) {
      case 'time':
        xAxis = d3.axisBottom(xScale as any);
        if (config.xAxisTickFormat) {
          xAxis.tickFormat(d3.timeFormat(config.xAxisTickFormat));
        }
        break;
      case 'linear':
        xAxis = d3.axisBottom(xScale as any);
        if (config.xAxisTickFormat) {
          xAxis.tickFormat(d3.format(config.xAxisTickFormat));
        }
        break;
      case 'ordinal':
        xAxis = d3.axisBottom(xScale as any);
        break;
    }

 const yAxis = d3.axisLeft(yScale);
    if (config.yAxisTickFormat) {
      yAxis.tickFormat(d3.format(config.yAxisTickFormat));
    }

    return { xAxis, yAxis };
  }



  /**
   * 현재 상태 반환 (Headless 메서드)
   */
  public getState(): LineChartState {
    return { ...this.state };
  }

   /**
   * 현재 스케일 타입 반환
   */
  public getScaleType(): 'time' | 'linear' | 'ordinal' {
    return this.state.scaleType;
  }


  /**
   * 그룹 표시/숨김 토글 (Headless 메서드)
   */
  public toggleGroup(group: string): this {
    if (this.state.visibleGroups.has(group)) {
      this.state.visibleGroups.delete(group);
    } else {
      this.state.visibleGroups.add(group);
    }

    this.eventManager.toggleGroup(group);
    return this;
  }

  /**
   * 특정 위치의 데이터 찾기
   */
  public findDataAtPosition(x: number, y: number): ProcessedDataPoint | null {
    if (!this.state.scales) return null;

    const { yScale } = this.state.scales;
    const config = this.config as LineChartConfig;
    const threshold = (config.dotRadius || 4) + 5;

    let closestData: ProcessedDataPoint | null = null;
    let minDistance = Infinity;

    this.state.data.forEach(d => {
      if (!this.state.visibleGroups.has(d.group)) return;

      const dotX = this.getXCoordinate(d);
      const dotY = yScale(d.y);
      
      const distance = Math.sqrt(
        Math.pow(x - dotX, 2) + Math.pow(y - dotY, 2)
      );

      if (distance < threshold && distance < minDistance) {
        minDistance = distance;
        closestData = d;
      }
    });

    return closestData;
  }

    /**
   * 범례 데이터 계산
   */
  public calculateLegendData(): Array<{
    group: string;
    color: string;
    visible: boolean;
  }> {
    if (!this.state.scales) {
      this.createScales();
    }

    const { colorScale } = this.state.scales!;

    return this.state.groups.map(group => ({
      group,
      color: colorScale(group),
      visible: this.state.visibleGroups.has(group)
    }));
  }

  /**
   * 데이터 통계 정보 (Headless 메서드)
   */
  public getDataStats() {
    return DataProcessor.getDataStats(this.state.data);
  }

  // ============================================
  // 렌더링 메서드들 (실제 DOM 조작)
  // ============================================

  /**
   * SVG 렌더링 컨텍스트 초기화
   */
  private initializeRenderContext(): void {
    // 기존 SVG 제거
    d3.select(this.container).select('svg').remove();

    // 새 SVG 생성
    const svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height);

    const defs = svg.append('defs');

    const chartArea = svg.append('g')
      .attr('class', 'chart-area')
      .attr('transform', `translate(${this.config.margin.left}, ${this.config.margin.top})`);

    this.renderContext = {
      container: this.container,
      svg,
      chartArea,
      defs
    };
  }

  /**
   * 축 렌더링
   */
  private renderAxes(): void {
    if (!this.renderContext || !this.state.scales) return;

    const config = this.config as LineChartConfig;
    const { chartArea } = this.renderContext;
    const { innerWidth, innerHeight } = this.state.scales;

    // 기존 축 제거
    chartArea.selectAll('.axis').remove();
    chartArea.selectAll('.grid').remove();

    const { xAxis, yAxis } = this.calculateAxes();

    // X축 렌더링
    if (config.showXAxis) {
      const xAxisGroup = chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis);

      // X축 라벨
      if (config.xAxisLabel) {
        xAxisGroup.append('text')
          .attr('class', 'axis-label')
          .attr('x', innerWidth / 2)
          .attr('y', 35)
          .attr('text-anchor', 'middle')
          .text(config.xAxisLabel);
      }
    }

    // Y축 렌더링
    if (config.showYAxis) {
      const yAxisGroup = chartArea.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis);

      // Y축 라벨
      if (config.yAxisLabel) {
        yAxisGroup.append('text')
          .attr('class', 'axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -innerHeight / 2)
          .attr('y', -40)
          .attr('text-anchor', 'middle')
          .text(config.yAxisLabel);
      }
    }

    // 격자선 렌더링
    if (config.gridLines) {
      // X 격자선
      chartArea.append('g')
        .attr('class', 'grid x-grid')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis.tickSize(-innerHeight).tickFormat(() => ''));

      // Y 격자선  
      chartArea.append('g')
        .attr('class', 'grid y-grid')
        .call(yAxis.tickSize(-innerWidth).tickFormat(() => ''));
    }
  }

  /**
   * 라인 렌더링
   */
  private renderLines(): void {
    if (!this.renderContext || !this.state.scales) return;

    const config = this.config as LineChartConfig;
    const { chartArea, defs } = this.renderContext;
    const { colorScale } = this.state.scales;

    // 기존 라인 제거
    chartArea.selectAll('.line-group').remove();

    const linePaths = this.calculateLinePaths();
    const areaPaths = config.showAreaFill ? this.calculateAreaPaths() : new Map();

    // 그룹별 라인 렌더링
    this.state.groups.forEach(group => {
      if (!this.state.visibleGroups.has(group)) return;

      const color = colorScale(group);
      const lineGroup = chartArea.append('g').attr('class', `line-group line-group-${group.replace(/\s+/g, '-')}`);

      // 영역 렌더링 (라인보다 먼저)
      if (config.showAreaFill && areaPaths.has(group)) {
        const areaPath = areaPaths.get(group)!;
        
        let fillColor = color;
        
        // 그라데이션 사용
        if (config.areaGradient) {
          const gradientId = RenderingUtils.createAreaGradient(
            defs, 
            color, 
            group, 
            config.areaFillOpacity || 0.1
          );
          fillColor = `url(#${gradientId})`;
        } else {
          fillColor = RenderingUtils.adjustColorOpacity(color, config.areaFillOpacity || 0.1);
        }

        const area = lineGroup.append('path')
          .attr('class', `area area-${group.replace(/\s+/g, '-')}`)
          .attr('d', areaPath)
          .attr('fill', fillColor)
          .attr('stroke', 'none');

        // 영역 애니메이션
        if (config.enableAnimation) {
          RenderingUtils.animateArea(
            area,
            defs,
            this.state.scales?.innerWidth ?? 0,
            this.state.scales?.innerHeight ?? 0,
            config.animationDuration
          );
        }
      }

      // 라인 렌더링
      if (linePaths.has(group)) {
        const linePath = linePaths.get(group)!;
        
        const line = lineGroup.append('path')
          .attr('class', `line line-${group.replace(/\s+/g, '-')}`)
          .attr('d', linePath)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', config.lineWidth || 2);

        // 라인 애니메이션
        if (config.enableAnimation) {
          RenderingUtils.animatePath(line, config.animationDuration);
        }
      }
    });
  }

  /**
   * 점 렌더링
   */
  private renderDots(): void {
    if (!this.renderContext || !this.state.scales) return;

    const config = this.config as LineChartConfig;
    if (!config.showDots) return;

    const { chartArea } = this.renderContext;
    const { colorScale } = this.state.scales;

    // 기존 점 제거
    chartArea.selectAll('.dots-group').remove();

    const dotPositions = this.calculateDotPositions();

    // 그룹별 점 렌더링
    this.state.groups.forEach(group => {
      if (!this.state.visibleGroups.has(group)) return;
      if (!dotPositions.has(group)) return;

      const positions = dotPositions.get(group)!;
      const color = colorScale(group);
      const dotColor = config.dotColors?.[this.state.groups.indexOf(group)] || color;

      const dotsGroup = chartArea.append('g')
        .attr('class', `dots-group dots-group-${group.replace(/\s+/g, '-')}`);

      const dots = dotsGroup.selectAll('.dot')
        .data(positions)
        .enter()
        .append('circle')
        .attr('class', `dot dot-${group.replace(/\s+/g, '-')}`)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', config.dotRadius || 4)
        .attr('fill', dotColor)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer');

      // ARIA 접근성
      dots.attr('aria-label', d => RenderingUtils.createAriaLabel(d.data, 'line'));

      // 점 애니메이션
      if (config.enableAnimation) {
        RenderingUtils.animateDots(
          dots, 
          config.dotRadius || 4, 
          config.animationDuration,
          100 // 라인 애니메이션 후 지연
        );
      }
    });
  }

  /**
   * 툴팁 설정
   */
  private setupTooltipEvents(): void {
    if (!this.renderContext || !this.state.scales) return;

    const config = this.config as LineChartConfig;
    if (!config.showTooltip) return;

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
        
        const position = RenderingUtils.calculateTooltipPosition(
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

  /**
   * 기본 툴팁 내용 생성
   */
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

  /**
   * 범례 렌더링
   */
  private renderLegend(): void {
    if (!this.renderContext || !this.state.scales) return;

    const config = this.config as LineChartConfig;
    if (!config.showLegend) return;

    const { svg } = this.renderContext;

    // 기존 범례 제거
    svg.select('.legend').remove();

    const legendData = this.calculateLegendData();
    const legendPosition = config.legendPosition || 'top';
    
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', this.calculateLegendTransform(legendPosition));

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => this.calculateLegendItemTransform(legendPosition, i))
      .style('cursor', 'pointer')
      .style('opacity', d => d.visible ? 1 : 0.5);

    // 범례 색상 표시
    legendItems.append('rect')
      .attr('width', 15)
      .attr('height', 3)
      .attr('fill', d => d.color);

    // 범례 텍스트
    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 0)
      .attr('dy', '0.32em')
      .style('font-size', config.legendStyle?.fontSize || '12px')
      .text(d => d.group);

    // 범례 클릭 이벤트
    legendItems.on('click', (event, d) => {
      this.toggleGroup(d.group);
      this.update(); // 다시 렌더링
    });
  }

  /**
   * 범례 위치 계산
   */
  private calculateLegendTransform(position: string): string {
    switch (position) {
      case 'top':
        return `translate(${this.config.margin.left}, 15)`;
      case 'bottom':
        return `translate(${this.config.margin.left}, ${this.config.height - 15})`;
      case 'left':
        return `translate(15, ${this.config.margin.top})`;
      case 'right':
        return `translate(${this.config.width - 120}, ${this.config.margin.top})`;
      default:
        return `translate(${this.config.margin.left}, 15)`;
    }
  }

  /**
   * 범례 아이템 위치 계산
   */
  private calculateLegendItemTransform(position: string, index: number): string {
    const spacing = 100;
    
    if (position === 'left' || position === 'right') {
      return `translate(0, ${index * 20})`;
    } else {
      return `translate(${index * spacing}, 0)`;
    }
  }

  /**
   * 스타일 적용
   */
  private applyStyles(): void {
    if (!this.renderContext) return;

    const { svg } = this.renderContext;
    const config = this.config as LineChartConfig;

    // 격자선 스타일
    svg.selectAll('.grid line')
      .attr('stroke', config.gridColor || '#f0f0f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // 축 스타일
    svg.selectAll('.axis .domain')
      .attr('stroke', config.axisColor || '#d0d0d0');

    // 텍스트 스타일  
    svg.selectAll('text')
      .style('font-family', 'Inter, system-ui, sans-serif')
      .attr('fill', '#666');

    // 제목 렌더링
    if (config.title) {
      svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', this.calculateTitleX(config.titlePosition))
        .attr('y', 20)
        .attr('text-anchor', this.calculateTitleAnchor(config.titlePosition))
        .style('font-size', config.titleStyle?.fontSize || '16px')
        .style('font-weight', config.titleStyle?.fontWeight || 'bold')
        .style('fill', config.titleStyle?.color || '#333')
        .text(config.title);
    }
  }

  /**
   * 제목 X 좌표 계산
   */
  private calculateTitleX(position?: string): number {
    switch (position) {
      case 'LEFT':
        return this.config.margin.left;
      case 'RIGHT':
        return this.config.width - this.config.margin.right;
      case 'CENTER':
      default:
        return this.config.width / 2;
    }
  }

  /**
   * 제목 텍스트 앵커 계산
   */
  private calculateTitleAnchor(position?: string): string {
    switch (position) {
      case 'LEFT':
        return 'start';
      case 'RIGHT':
        return 'end';
      case 'CENTER':
      default:
        return 'middle';
    }
  }

  /**
   * 이벤트 전달 설정
   */
  private setupEventForwarding(): void {
    // EventManager의 이벤트를 BaseChart의 이벤트로 전달
    this.eventManager.on('chartHover', (data) => this.emit('chartHover', data));
    this.eventManager.on('chartClick', (data) => this.emit('chartClick', data));
    this.eventManager.on('chartMouseenter', (data) => this.emit('chartMouseenter', data));
    this.eventManager.on('chartMouseleave', (data) => this.emit('chartMouseleave', data));
    this.eventManager.on('legendToggle', (data) => this.emit('legendToggle', data));
  }

  /**
   * 이벤트 관리자에 히트 테스트 로직 제공
   */
  private setupHitTesting(): void {
    // EventManager에 히트 테스트 로직 주입
    (this.eventManager as any).findDataAtPosition = (event: { clientX: number; clientY: number }) => {
      if (!this.renderContext) return null;
      
      const rect = this.container.getBoundingClientRect();
      const x = event.clientX - rect.left - this.config.margin.left;
      const y = event.clientY - rect.top - this.config.margin.top;
      
      return this.findDataAtPosition(x, y);
    };
  }

  // ============================================
  // Public API (BaseChart 오버라이드)
  // ============================================

  /**
   * 메인 렌더링 메서드
   */
  public render(): this {
    if (this.state.data.length === 0) {
      console.warn('No data to render');
      return this;
    }

    // 1. 렌더링 컨텍스트 초기화
    this.initializeRenderContext();

    // 2. 스케일 생성
    this.createScales();

    // 3. 렌더링 단계별 실행
    this.renderAxes();
    this.renderLines();  
    this.renderDots();
    this.renderLegend();

    // 4. 스타일 적용
    this.applyStyles();

    // 5. 상호작용 설정
    this.eventManager.setup(this.container, this.state.data);
    this.setupHitTesting();
    this.setupTooltipEvents();

    // 6. 상태 업데이트
    this.state.isRendered = true;

    this.emit('rendered', { chart: this });
    return this;
  }

  /**
   * 업데이트 메서드
   */
  public update(): this {
    if (this.state.isRendered) {
      this.render();
      this.emit('updated', { chart: this });
    }
    return this;
  }

  /**
   * 설정 업데이트
   */
  public updateConfig(newConfig: Partial<LineChartConfig>): this {
    this.config = { ...this.config, ...newConfig };
    
    // 스케일 관리자 설정 업데이트
    this.scaleManager.updateSize({
      width: this.config.width,
      height: this.config.height,
      margin: this.config.margin
    });

    return this;
  }

  /**
   * 정리 메서드
   */
  public destroy(): void {
    this.eventManager.destroy();
    
    if (this.renderContext) {
      this.renderContext.svg.remove();
      this.renderContext = null;
    }

    this.removeAllListeners();
    this.state.isRendered = false;
  }
}