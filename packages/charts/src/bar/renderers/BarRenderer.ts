/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import { RenderingUtils } from '../../shared';
import { FontSizeHelper } from '@beaubrain/chart-lib-core';
import type { BarChartConfig } from '@beaubrain/chart-lib-types';
import type { BarChartState } from '../BarChartState';
import type { CoordinateCalculator } from '../CoordinateCalculator';
import { RenderContext } from '../BarChart';


/**
 * 바 렌더링만 담당하는 클래스
 */
export class BarRenderer {
  constructor(
    private state: BarChartState,
    private calculator: CoordinateCalculator,
    private config: BarChartConfig,
    private context: RenderContext
  ) {}

  render(): void {
    if (this.state.isEmpty()) return;

    this.clearPreviousRender();
    this.renderBars();
  }

  private clearPreviousRender(): void {
    this.context.chartArea.selectAll('.bar-group').remove();
  }

  private renderBars(): void {
    const barPositions = this.calculator.calculateBarPositions();
    const scales = this.state.getScales();
    if (!scales) return;

    const { colorScale } = scales;
    const borderRadius = this.config.barBorderRadius || 0;

    this.state.getGroups().forEach((group, groupIndex) => {
      if (!this.state.isGroupVisible(group)) return;
      if (!barPositions.has(group)) return;

      const positions = barPositions.get(group)!;
      const color = colorScale(group);
      const barColor = this.config.barColors?.[groupIndex] || color;

      // 바 그룹 생성
      const barGroup = this.context.chartArea.append('g')
        .attr('class', `bar-group bar-group-${this.sanitizeClassName(group)}`);

      // 바 렌더링
      const bars = barGroup.selectAll('.bar')
        .data(positions)
        .enter()
        .append('rect')
        .attr('class', `bar bar-${this.sanitizeClassName(group)}`)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .attr('fill', barColor)
        .attr('rx', borderRadius)
        .attr('ry', borderRadius)
        .style('cursor', 'pointer');

      // ARIA 접근성
      bars.attr('aria-label', d =>
        RenderingUtils.createAriaLabel(d.data, 'bar')
      );

      // 바 애니메이션
      if (this.config.enableAnimation) {
        this.animateBars(bars);
      }

      // 값 표시
      if (this.config.showValues) {
        this.renderValues(barGroup, positions);
      }
    });
  }

  /**
   * 바 애니메이션
   */
  private animateBars(
    bars: d3.Selection<SVGRectElement, any, SVGGElement, unknown>
  ): void {
    const orientation = this.config.orientation || 'vertical';
    const duration = this.config.animationDuration || 300;
    const delay = this.config.animationDelay || 0;

    if (orientation === 'vertical') {
      // 세로 바: 아래에서 위로 성장
      bars
        .attr('y', d => d.y + d.height)
        .attr('height', 0)
        .transition()
        .delay((d, i) => delay + i * 20)
        .duration(duration)
        .ease(d3.easeQuadOut)
        .attr('y', d => d.y)
        .attr('height', d => d.height);
    } else {
      // 가로 바: 왼쪽에서 오른쪽으로 성장
      bars
        .attr('width', 0)
        .transition()
        .delay((d, i) => delay + i * 20)
        .duration(duration)
        .ease(d3.easeQuadOut)
        .attr('width', d => d.width);
    }
  }

  /**
   * 값 표시 렌더링
   */
  private renderValues(
    barGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    positions: any[],
  ): void {
    const orientation = this.config.orientation || 'vertical';
    const valuePosition = this.config.valuePosition || 'top';
    const valueFormat = this.config.valueFormat || '.1f';

    // 🔧 FontSizeHelper로 값 폰트 사이즈 가져오기
    const legacyValueFontSize = typeof this.config.fonts?.valueFontSize === 'number'
      ? this.config.fonts?.valueFontSize
      : undefined;
    const valueFontSize = FontSizeHelper.getValueFontSize(
      this.config.fonts,
      legacyValueFontSize
    );

    const valueColor = this.config.valueColor || '#333';

    console.log('🎨 BarRenderer valueFontSize:', {
      valueFontSize,
      fonts: this.config.fonts,
      legacyValueFontSize: this.config.fonts?.valueFontSize
    });

    const values = barGroup.selectAll('.bar-value')
      .data(positions)
      .enter()
      .append('text')
      .attr('class', 'bar-value')
      .attr('font-size', `${valueFontSize}px`)
      .style('fill', valueColor)
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d3.format(valueFormat)(d.data.y));

    if (orientation === 'vertical') {
      // 세로 바
      values
        .attr('x', d => d.x + d.width / 2)
        .attr('y', d => {
          switch (valuePosition) {
          case 'top':
          case 'outside':
            return d.y - 5;
          case 'middle':
            return d.y + d.height / 2;
          case 'bottom':
            return d.y + d.height - 5;
          default:
            return d.y - 5;
          }
        })
        .attr('dy', valuePosition === 'middle' ? '0.35em' : '0');
    } else {
      // 가로 바
      values
        .attr('x', d => {
          switch (valuePosition) {
          case 'top':
          case 'outside':
            return d.x + d.width + 5;
          case 'middle':
            return d.x + d.width / 2;
          case 'bottom':
            return d.x + 5;
          default:
            return d.x + d.width + 5;
          }
        })
        .attr('y', d => d.y + d.height / 2)
        .attr('dy', '0.35em')
        .style('text-anchor', valuePosition === 'middle' ? 'middle' : 'start');
    }

    // 값 표시 애니메이션
    if (this.config.enableAnimation) {
      values
        .style('opacity', 0)
        .transition()
        .delay(this.config.animationDuration || 300)
        .duration(200)
        .style('opacity', 1);
    }
  }

  private sanitizeClassName(str: string): string {
    return str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');
  }
}