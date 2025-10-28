import * as d3 from 'd3';
import type { BarChartConfig } from '@charts-library/types';
import type { BarChartState } from '../BarChartState';
import type { CoordinateCalculator } from '../CoordinateCalculator';

import { BarRenderer } from './BarRenderer';
import { AxisRenderer } from './AxisRenderer';
import { LegendRenderer } from '../../line/renderers/LegendRenderer';
import { RenderContext } from '../BarChart';

/**
 * 모든 렌더링을 총괄하는 메인 렌더러
 *
 * 책임:
 * - 렌더링 컨텍스트 초기화
 * - 개별 렌더러들 조정
 * - 렌더링 순서 관리
 * - 스타일 적용
 */
export class BarChartRenderer {
  private axisRenderer: AxisRenderer | undefined;
  private barRenderer: BarRenderer | undefined;
  private legendRenderer: LegendRenderer | undefined;

  constructor(
    private container: HTMLElement,
    private state: BarChartState,
    private calculator: CoordinateCalculator,
    private config: BarChartConfig
  ) {}

  /**
   * 메인 렌더링 메서드
   */
  render(): RenderContext {
    // 1. 렌더링 컨텍스트 초기화
    const context = this.initializeRenderContext();

    // 2. 개별 렌더러들 초기화
    this.initializeRenderers(context);

    // 3. 렌더링 실행 (순서 중요)
    this.axisRenderer?.render();
    this.barRenderer?.render();
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
    d3.select(this.container).selectAll('svg').remove();

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
    this.barRenderer = new BarRenderer(this.state, this.calculator, this.config, context);
    this.legendRenderer = new LegendRenderer(this.calculator as any, this.config as any, context);
  }

  /**
   * 스타일 적용
   */
  private applyStyles(context: RenderContext): void {
    const { svg } = context;

    // 격자선 스타일
    svg.selectAll('.grid line')
      .attr('stroke', this.config.gridColor || '#f0f0f0')
      .attr('stroke-width', 1);

    // 축 스타일
    svg.selectAll('.axis .domain')
      .attr('stroke', this.config.axisColor || '#d0d0d0');

    svg.selectAll('.axis .tick line')
      .attr('stroke', this.config.axisColor || '#d0d0d0');

    // 텍스트 스타일
    svg.selectAll('text')
      .style('font-family', 'Inter, system-ui, sans-serif')
      .attr('fill', '#666');

    // 제목 렌더링
    if (this.config.title) {
      const margin = this.config.margin || { top: 20, right: 20, bottom: 40, left: 60 };

      svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', this.calculateTitleX(this.config.titlePosition))
        .attr('y', margin.top - 5)
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
  updateBars(context: RenderContext): void {
    this.barRenderer = new BarRenderer(this.state, this.calculator, this.config, context);
    this.barRenderer.render();
  }

  updateLegend(context: RenderContext): void {
    this.legendRenderer = new LegendRenderer(this.calculator as any, this.config as any, context);
    this.legendRenderer.render();
  }
}