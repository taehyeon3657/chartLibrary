import type { BarChartConfig } from "@charts-library/types";
import type { CoordinateCalculator } from "../CoordinateCalculator";
import type { BarChartState } from "../BarChartState";
import { RenderContext } from "../BarChart";


/**
 * 축 렌더링만 담당하는 클래스
 */
export class AxisRenderer {
  constructor(
    private state: BarChartState,
    private calculator: CoordinateCalculator,
    private config: BarChartConfig,
    private context: RenderContext
  ) {}

  render(): void {
    this.clearPreviousRender();
    this.renderAxes();
    this.renderGridLines();
  }

  private clearPreviousRender(): void {
    this.context.chartArea.selectAll('.axis').remove();
    this.context.chartArea.selectAll('.grid').remove();
  }

  private renderAxes(): void {
    const axesData = this.calculator.calculateAxes();
    const scales = this.state.getScales();
    if (!axesData || !scales) return;

    const { xAxis, yAxis } = axesData;
    const { innerHeight, innerWidth } = scales;
    const orientation = this.config.orientation || 'vertical';

    // X축 렌더링
    if (this.config.showXAxis) {
      const xAxisGroup = this.context.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis);

      // X축 라벨
      if (this.config.xAxisLabel) {
        const labelPosition = this.config.xAxisLabelPosition || 'center';
        let xPosition: number;

        switch (labelPosition) {
          case 'left':
            xPosition = 0;
            break;
          case 'right':
            xPosition = innerWidth;
            break;
          case 'center':
          default:
            xPosition = innerWidth / 2;
            break;
        }

        xAxisGroup.append('text')
          .attr('class', 'axis-label x-axis-label')
          .attr('x', xPosition)
          .attr('y', 35)
          .attr('text-anchor', labelPosition === 'right' ? 'end' : labelPosition === 'left' ? 'start' : 'middle')
          .attr('fill', '#666')
          .text(this.config.xAxisLabel);
      }
    }

    // Y축 렌더링
    if (this.config.showYAxis) {
      const yAxisGroup = this.context.chartArea.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis);

      // Y축 라벨
      if (this.config.yAxisLabel) {
        const labelPosition = this.config.yAxisLabelPosition || 'center';
        let yPosition: number;

        switch (labelPosition) {
          case 'top':
            yPosition = 0;
            break;
          case 'bottom':
            yPosition = innerHeight;
            break;
          case 'center':
          default:
            yPosition = innerHeight / 2;
            break;
        }

        yAxisGroup.append('text')
          .attr('class', 'axis-label y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -yPosition)
          .attr('y', -40)
          .attr('text-anchor', labelPosition === 'bottom' ? 'end' : labelPosition === 'top' ? 'start' : 'middle')
          .attr('fill', '#666')
          .text(this.config.yAxisLabel);
      }
    }
  }

  private renderGridLines(): void {
    if (!this.config.gridLines) return;

    const axesData = this.calculator.calculateAxes();
    const scales = this.state.getScales();
    if (!axesData || !scales) return;

    const { xAxis, yAxis } = axesData;
    const { innerWidth, innerHeight } = scales;
    const orientation = this.config.orientation || 'vertical';

    const gridLineStyle = this.config.gridLineStyle || 'dashed';
    const dashArray = gridLineStyle === 'dashed' ? '2,2' : '0';
    const gridColor = this.config.gridColor || '#f0f0f0';

    // 가로 격자선
    if (this.config.horizontalGridLines !== false) {
      const horizontalGrid = this.context.chartArea.append('g')
        .attr('class', 'grid horizontal-grid')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(
          orientation === 'vertical'
            ? xAxis.tickSize(-innerHeight).tickFormat(() => '')
            : yAxis.tickSize(-innerWidth).tickFormat(() => '')
        );

      horizontalGrid.selectAll('line')
        .attr('stroke', gridColor)
        .attr('stroke-dasharray', dashArray);
    }

    // 세로 격자선
    if (this.config.verticalGridLines !== false) {
      const verticalGrid = this.context.chartArea.append('g')
        .attr('class', 'grid vertical-grid')
        .call(
          orientation === 'vertical'
            ? yAxis.tickSize(-innerWidth).tickFormat(() => '')
            : xAxis.tickSize(-innerHeight).tickFormat(() => '')
        );

      verticalGrid.selectAll('line')
        .attr('stroke', gridColor)
        .attr('stroke-dasharray', dashArray);
    }
  }
}