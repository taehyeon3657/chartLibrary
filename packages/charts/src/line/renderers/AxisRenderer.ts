import { LineChartConfig } from '@beaubrain/chart-lib-types';
import { FontSizeHelper } from '@beaubrain/chart-lib-core';
import { CoordinateCalculator } from '../CoordinateCalculator';
import { LineChartState } from '../LineChartState';
import { RenderContext } from '../LineChart';

/**
 * 축 렌더링만 담당하는 클래스
 */
export class AxisRenderer {
  constructor(
    private state: LineChartState,
    private calculator: CoordinateCalculator,
    private config: LineChartConfig,
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
    const { innerHeight } = scales;

    // 부모 컨테이너의 실제 폰트 가져오기
    const computedStyle = window.getComputedStyle(this.context.container);
    const inheritedFont = computedStyle.fontFamily || 'inherit';

    //  FontSizeHelper로 폰트 사이즈 가져오기
    const xAxisTickSize = FontSizeHelper.getXAxisTickFontSize(this.config.fonts);
    const yAxisTickSize = FontSizeHelper.getYAxisTickFontSize(this.config.fonts);
    const xAxisLabelSize = FontSizeHelper.getXAxisLabelFontSize(this.config.fonts);
    const yAxisLabelSize = FontSizeHelper.getYAxisLabelFontSize(this.config.fonts);


    // X축 렌더링
    if (this.config.showXAxis) {
      const xAxisGroup = this.context.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis);

      //  X축 눈금 텍스트 스타일 적용
      xAxisGroup.selectAll('text')
        .style('font-family', inheritedFont)
        .attr('font-size', `${xAxisTickSize}px`)
        .attr('fill', '#111');

      // X축 라벨
      if (this.config.xAxisLabel) {
        xAxisGroup.append('text')
          .attr('class', 'axis-label x-axis-label')
          .attr('x', scales.innerWidth / 2)
          .attr('y', 35)
          .attr('text-anchor', 'middle')
          .style('font-family', inheritedFont)
          .attr('font-size', `${xAxisLabelSize}px`)
          .style('font-weight', '500')
          .attr('fill', '#111')
          .text(this.config.xAxisLabel);
      }
    }

    // Y축 렌더링
    if (this.config.showYAxis) {
      const yAxisGroup = this.context.chartArea.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis);

      //  Y축 눈금 텍스트 스타일 적용
      yAxisGroup.selectAll('text')
        .style('font-family', inheritedFont)
        .attr('font-size', `${yAxisTickSize}px`)
        .attr('fill', '#111');

      // Y축 라벨
      if (this.config.yAxisLabel) {
        yAxisGroup.append('text')
          .attr('class', 'axis-label y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -scales.innerHeight / 2)
          .attr('y', -40)
          .attr('text-anchor', 'middle')
          .style('font-family', inheritedFont)
          .attr('font-size', `${yAxisLabelSize}px`)
          .style('font-weight', '500')
          .attr('fill', '#111')
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

    // X 격자선
    this.context.chartArea.append('g')
      .attr('class', 'grid x-grid')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis.tickSize(-innerHeight).tickFormat(() => ''));

    // Y 격자선
    this.context.chartArea.append('g')
      .attr('class', 'grid y-grid')
      .call(yAxis.tickSize(-innerWidth).tickFormat(() => ''));
  }
}