import * as d3 from 'd3';
import { RenderingUtils } from '../../shared';
import type { LineChartConfig } from '@beaubrain/types';
import type { LineChartState } from '../LineChartState';
import type { CoordinateCalculator } from '../CoordinateCalculator';
import type { RenderContext } from '../LineChart';

/**
 * 라인과 영역 렌더링만 담당하는 클래스
 */
export class LineRenderer {
  constructor(
    private state: LineChartState,
    private calculator: CoordinateCalculator,
    private config: LineChartConfig,
    private context: RenderContext
  ) {}

  render(): void {
    if (this.state.isEmpty()) return;

    this.clearPreviousRender();

    if (this.config.showAreaFill) {
      this.renderAreas();
    }

    this.renderLines();
  }

  private clearPreviousRender(): void {
    this.context.chartArea.selectAll('.line-group').remove();
  }

  private renderAreas(): void {
    const areaPaths = this.calculator.calculateAreaPaths();
    const scales = this.state.getScales();
    if (!scales) return;

    const { colorScale } = scales;

    this.state.getGroups().forEach(group => {
      if (!this.state.isGroupVisible(group)) return;
      if (!areaPaths.has(group)) return;

      const areaPath = areaPaths.get(group)!;
      const color = colorScale(group);

      const lineGroup = this.getOrCreateLineGroup(group);

      let fillColor = color;

      // 그라데이션 사용
      if (this.config.areaGradient) {
        const gradientId = RenderingUtils.createAreaGradient(
          this.context.defs,
          color,
          group,
          this.config.areaFillOpacity || 0.1
        );
        fillColor = `url(#${gradientId})`;
      } else {
        fillColor = RenderingUtils.adjustColorOpacity(
          color,
          this.config.areaFillOpacity || 0.1
        );
      }

      const area = lineGroup.append('path')
        .attr('class', `area area-${this.sanitizeClassName(group)}`)
        .attr('d', areaPath)
        .attr('fill', fillColor)
        .attr('stroke', 'none');

      // 영역 애니메이션
      if (this.config.enableAnimation) {
        const scales = this.state.getScales()!;
        RenderingUtils.animateArea(
          area,
          this.context.defs,
          scales.innerWidth,
          scales.innerHeight,
          this.config.animationDuration || 300
        );
      }
    });
  }

  private renderLines(): void {
    const linePaths = this.calculator.calculateLinePaths();
    const scales = this.state.getScales();
    if (!scales) return;

    const { colorScale } = scales;

    this.state.getGroups().forEach(group => {
      if (!this.state.isGroupVisible(group)) return;
      if (!linePaths.has(group)) return;

      const linePath = linePaths.get(group)!;
      const color = colorScale(group);

      const lineGroup = this.getOrCreateLineGroup(group);

      const line = lineGroup.append('path')
        .attr('class', `line line-${this.sanitizeClassName(group)}`)
        .attr('d', linePath)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', this.config.lineWidth || 2);

      // 라인 애니메이션
      if (this.config.enableAnimation) {
        RenderingUtils.animatePath(line, this.config.animationDuration || 300);
      }
    });
  }

  private getOrCreateLineGroup(group: string): d3.Selection<SVGGElement, unknown, null, undefined> {
    const className = `line-group-${this.sanitizeClassName(group)}`;
    let lineGroup = this.context.chartArea.select<SVGGElement>(`.${className}`);

    if (lineGroup.empty()) {
      lineGroup = this.context.chartArea.append<SVGGElement>('g')
        .attr('class', `line-group ${className}`);
    }

    return lineGroup;
  }

  private sanitizeClassName(str: string): string {
    return str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');
  }
}