import { LineChartConfig } from '@beaubrain/chart-lib-types';
import { FontSizeHelper } from '@beaubrain/chart-lib-core';
import { CoordinateCalculator } from '../CoordinateCalculator';
import { RenderContext } from '../LineChart';

/**
 * 범례 렌더링만 담당하는 클래스
 */
export class LegendRenderer {
  constructor(
    private calculator: CoordinateCalculator,
    private config: LineChartConfig,
    private context: RenderContext
  ) {}

  render(): void {
    if (!this.config.showLegend) return;

    this.clearPreviousRender();
    this.renderLegend();
  }

  private clearPreviousRender(): void {
    this.context.svg.select('.legend').remove();
  }

  private renderLegend(): void {
    const legendData = this.calculator.calculateLegendData();
    const legendPosition = this.config.legendPosition || 'top';

    // 🔧 FontSizeHelper로 폰트 사이즈 가져오기
    const legendFontSize = FontSizeHelper.getLegendFontSize(
      this.config.fonts,
      this.config.fonts?.legendFontSize !== undefined
        ? { fontSize: Number(this.config.fonts.legendFontSize) }
        : undefined
    );

    console.log('🎨 LegendRenderer fontSizes:', {
      legendFontSize,
      fontSizes: this.config.fonts,
      legendStyle: this.config.fonts?.legendFontSize
    });

    const legend = this.context.svg.append('g')
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
      .attr('font-size', `${legendFontSize}px`)
      .text(d => d.group);

    // 범례 클릭 이벤트는 상위에서 처리
    legendItems.attr('data-group', d => d.group);
  }

  private calculateLegendTransform(position: string): string {
    switch (position) {
    case 'top':
      return `translate(${this.config.margin?.left || 0}, 15)`;
    case 'bottom':
      return `translate(${this.config.margin?.left || 0}, ${(this.config.height || 0) - 15})`;
    case 'left':
      return `translate(15, ${this.config.margin?.top || 0})`;
    case 'right':
      return `translate(${(this.config.width || 0) - 100}, ${this.config.margin?.top || 0})`;
    default:
      return `translate(${this.config.margin?.left || 0}, 15)`;
    }
  }

  private calculateLegendItemTransform(position: string, index: number): string {
    const spacing = 100;

    if (position === 'left' || position === 'right') {
      return `translate(0, ${index * 20})`;
    } else {
      return `translate(${index * spacing}, 0)`;
    }
  }
}