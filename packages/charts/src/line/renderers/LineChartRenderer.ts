import * as d3 from 'd3';
import type { LineChartConfig } from '@charts-library/types';
import type { LineChartState } from '../LineChartState';
import type { CoordinateCalculator } from '../CoordinateCalculator';
import type { RenderContext } from '../LineChart';
import { LineRenderer } from './LineRenderer';
import { DotRenderer } from './DotRenderer';
import { AxisRenderer } from './AxisRenderer';
import { LegendRenderer } from './LegendRenderer';

/**
 * 모든 렌더링을 총괄하는 메인 렌더러
 * 
 * 책임:
 * - 렌더링 컨텍스트 초기화
 * - 개별 렌더러들 조정
 * - 렌더링 순서 관리
 * - 스타일 적용
 */
export class LineChartRenderer {
  private axisRenderer: AxisRenderer | undefined;
  private lineRenderer: LineRenderer | undefined;
  private dotRenderer: DotRenderer | undefined;
  private legendRenderer: LegendRenderer | undefined;

  constructor(
    private container: HTMLElement,
    private state: LineChartState,
    private calculator: CoordinateCalculator,
    private config: LineChartConfig
  ) {
    // 렌더 컨텍스트는 처음 렌더링 시에 생성
  }

  /**
   * 메인 렌더링 메서드
   */
  render(): RenderContext {
    // 1. 렌더링 컨텍스트 초기화
    const context = this.initializeRenderContext();
    
    // 2. 개별 렌더러들 초기화 (컨텍스트 생성 후)
    this.initializeRenderers(context);
    
    // 3. 렌더링 실행 (순서 중요)
    this.axisRenderer?.render();
    this.lineRenderer?.render();
    this.dotRenderer?.render();
    this.legendRenderer?.render();

    // 4. 스타일 적용
    this.applyStyles(context);
    
    return context;
  }

  /**
   * SVG 렌더링 컨텍스트 초기화
   */
  private initializeRenderContext(): RenderContext {
    // 기존 SVG 제거
    d3.select(this.container).select('svg').remove();

    // 새 SVG 생성
    const svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.config.width || 600)
      .attr('height', this.config.height || 400);

    const defs = svg.append('defs');

    const margin = this.config.margin || { top: 20, right: 20, bottom: 40, left: 60 };
    const chartArea = svg.append('g')
      .attr('class', 'chart-area')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    return {
      container: this.container,
      svg,
      chartArea,
      defs
    };
  }

  /**
   * 개별 렌더러들 초기화
   */
  private initializeRenderers(context: RenderContext): void {
    this.axisRenderer = new AxisRenderer(this.state, this.calculator, this.config, context);
    this.lineRenderer = new LineRenderer(this.state, this.calculator, this.config, context);
    this.dotRenderer = new DotRenderer(this.state, this.calculator, this.config, context);
    this.legendRenderer = new LegendRenderer(this.state, this.calculator, this.config, context);
  }

  /**
   * 스타일 적용
   */
  private applyStyles(context: RenderContext): void {
    const { svg } = context;

    // 격자선 스타일
    svg.selectAll('.grid line')
      .attr('stroke', this.config.gridColor || '#f0f0f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // 축 스타일
    svg.selectAll('.axis .domain')
      .attr('stroke', this.config.axisColor || '#d0d0d0');

    // 텍스트 스타일  
    svg.selectAll('text')
      .style('font-family', 'Inter, system-ui, sans-serif')
      .attr('fill', '#666');

    // 제목 렌더링
    if (this.config.title) {
      svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', this.calculateTitleX(this.config.titlePosition))
        .attr('y', 20)
        .attr('text-anchor', this.calculateTitleAnchor(this.config.titlePosition))
        .style('font-size', this.config.titleStyle?.fontSize || '16px')
        .style('font-weight', this.config.titleStyle?.fontWeight || 'bold')
        .style('fill', this.config.titleStyle?.color || '#333')
        .text(this.config.title);
    }
  }

  private calculateTitleX(position?: string): number {
    const margin = this.config.margin || { top: 20, right: 20, bottom: 40, left: 60 };
    const width = this.config.width || 600;
    
    switch (position) {
      case 'LEFT':
        return margin.left;
      case 'RIGHT':
        return width - margin.right;
      case 'CENTER':
      default:
        return width / 2;
    }
  }

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
   * 부분 업데이트 (성능 최적화)
   */
  updateLines(context: RenderContext): void {
    this.lineRenderer = new LineRenderer(this.state, this.calculator, this.config, context);
    this.lineRenderer.render();
  }

  updateDots(context: RenderContext): void {
    this.dotRenderer = new DotRenderer(this.state, this.calculator, this.config, context);
    this.dotRenderer.render();
  }

  updateLegend(context: RenderContext): void {
    this.legendRenderer = new LegendRenderer(this.state, this.calculator, this.config, context);
    this.legendRenderer.render();
  }
}