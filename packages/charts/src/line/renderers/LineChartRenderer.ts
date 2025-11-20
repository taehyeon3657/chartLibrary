/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import type { LineChartConfig } from '@beaubrain/chart-lib-types';
import type { LineChartState } from '../LineChartState';
import type { CoordinateCalculator } from '../CoordinateCalculator';

import { LineRenderer } from './LineRenderer';
import { AxisRenderer } from './AxisRenderer';
import { LegendRenderer } from './LegendRenderer';
import { RenderContext } from '../LineChart';
import { FontSizeHelper } from '@beaubrain/chart-lib-core';

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
  private legendRenderer: LegendRenderer | undefined;

  constructor(
    private container: HTMLElement,
    private state: LineChartState,
    private calculator: CoordinateCalculator,
    private config: LineChartConfig
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
    this.lineRenderer?.render();

    // showLegend config 확인 후 렌더링
    if (this.config.showLegend !== false) {
      this.legendRenderer?.render();
    }

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

    //  FIX: 부모 컨테이너의 실제 폰트 가져오기
    const computedStyle = window.getComputedStyle(this.container);
    const inheritedFont = computedStyle.fontFamily || 'inherit';

    // 새 SVG 생성
    const svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.config.width || 600)
      .attr('height', this.config.height || 400);

    //  FIX: 실제 계산된 폰트를 SVG style에 직접 주입
    svg.append('style').text(`
      text {
        font-family: ${inheritedFont} !important;
      }
    `);

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
    this.legendRenderer = new LegendRenderer(this.calculator as any, this.config as any, context);
  }

  /**
   * 스타일 적용
   */
  private applyStyles(context: RenderContext): void {
    const { svg } = context;

    const computedStyle = window.getComputedStyle(this.container);
    const inheritedFont = computedStyle.fontFamily || 'monospace';

    // 격자선 스타일
    svg.selectAll('.grid line')
      .attr('stroke', this.config.gridColor || '#f0f0f0')
      .attr('stroke-width', 1);

    // 축 스타일
    svg.selectAll('.axis .domain')
      .attr('stroke', this.config.axisColor || '#111');

    svg.selectAll('.axis .tick line')
      .attr('stroke', this.config.axisColor || '#111');

    // 모든 텍스트에 강제로 폰트 적용
    svg.selectAll('text').each(function() {
      if (this && (this as HTMLElement).style) {
        (this as HTMLElement).style.fontFamily = inheritedFont;
        (this as HTMLElement).style.setProperty('font-family', inheritedFont, 'important');
      }
    });

    // 축 텍스트에 특별히 한번 더 적용
    svg.selectAll('.axis text').each(function() {
      if (this && (this as HTMLElement).style) {
        (this as HTMLElement).style.fontFamily = inheritedFont;
        (this as HTMLElement).style.setProperty('font-family', inheritedFont, 'important');
        (this as SVGTextElement).setAttribute('style', `font-family: ${inheritedFont} !important`);
      }
    });

    // 제목 렌더링
    if (this.config.title) {
      const margin = this.config.margin || { top: 20, right: 20, bottom: 40, left: 60 };

      //  FontSizeHelper로 제목 폰트 사이즈 가져오기
      const titleFontSize = FontSizeHelper.getTitleFontSize(
        this.config.fonts,
        { fontSize: this.config.fonts?.titleFontSize }
      );

      svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', this.calculateTitleX(this.config.titlePosition))
        .attr('y', margin.top - 5)
        .attr('text-anchor', this.calculateTitleAnchor(this.config.titlePosition))
        .attr('font-size', `${titleFontSize}px`)
        .style('font-weight', this.config.fonts?.titleFontWeight || 'bold')
        .style('font-family', inheritedFont)
        .style('fill', this.config.fonts?.titleFontColor || '#333')
        .text(this.config.title);
    }
  }

  /**
   * 제목 X 위치 계산
   */
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
   * 부분 업데이트 (성능 최적화)
   * 라인만 다시 렌더링
   */
  updateLines(context: RenderContext): void {
    this.lineRenderer = new LineRenderer(this.state, this.calculator, this.config, context);
    this.lineRenderer.render();
  }

  updateDots(context: RenderContext): void {
    this.lineRenderer = new LineRenderer(this.state, this.calculator, this.config, context);
    this.lineRenderer.render();
  }

  /**
   * Legend만 다시 렌더링
   */
  updateLegend(context: RenderContext): void {
    // showLegend가 false가 아닐 때만 업데이트
    if (this.config.showLegend !== false) {
      this.legendRenderer = new LegendRenderer(this.calculator as any, this.config as any, context);
      this.legendRenderer.render();
    }
  }
}