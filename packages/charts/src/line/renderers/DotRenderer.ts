import { LineChartConfig } from "@beaubrain/types";
import { CoordinateCalculator } from "../CoordinateCalculator";
import { LineChartState } from "../LineChartState";
import { RenderContext } from "../LineChart";
import { RenderingUtils } from "../../shared";
import * as d3 from 'd3';

/**
 * 점(도트) 렌더링만 담당하는 클래스
 */
export class DotRenderer {
  constructor(
    private state: LineChartState,
    private calculator: CoordinateCalculator,
    private config: LineChartConfig,
    private context: RenderContext
  ) {}

  render(): void {
    if (!this.config.showDots || this.state.isEmpty()) return;

    this.clearPreviousRender();
    this.renderDots();
  }

  private clearPreviousRender(): void {
    this.context.chartArea.selectAll('.dots-group').remove();
  }

  private renderDots(): void {
    const dotPositions = this.calculator.calculateDotPositions();
    const scales = this.state.getScales();
    if (!scales) return;

    const { colorScale } = scales;

    this.state.getGroups().forEach((group, groupIndex) => {
      if (!this.state.isGroupVisible(group)) return;
      if (!dotPositions.has(group)) return;

      const positions = dotPositions.get(group)!;
      const color = colorScale(group);
      const dotColor = this.config.dotColors?.[groupIndex] || color;

      const darkerStroke = d3.color(dotColor)
  ? d3.hsl(dotColor).darker(0.7).toString()
  : dotColor;

      const dotsGroup = this.context.chartArea.append('g')
        .attr('class', `dots-group dots-group-${this.sanitizeClassName(group)}`);

      const dots = dotsGroup.selectAll('.dot')
        .data(positions)
        .enter()
        .append('circle')
        .attr('class', `dot dot-${this.sanitizeClassName(group)}`)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', this.config.dotRadius || 4)
        .attr('fill', dotColor)
        .attr('stroke', darkerStroke)
        .attr('stroke-width', 1)
        .style('cursor', 'pointer');

      // ARIA 접근성
      dots.attr('aria-label', d =>
        RenderingUtils.createAriaLabel(d.data, 'line')
      );

      // 점 애니메이션
      if (this.config.enableAnimation) {
        RenderingUtils.animateDots(
          dots,
          this.config.dotRadius || 4,
          this.config.animationDuration || 300,
          100 // 라인 애니메이션 후 지연
        );
      }
    });
  }

  private sanitizeClassName(str: string): string {
    return str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');
  }
}