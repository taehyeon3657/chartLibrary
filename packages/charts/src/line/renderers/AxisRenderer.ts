import { LineChartConfig } from '@beaubrain/chart-lib-types';
import { FontSizeHelper } from '@beaubrain/chart-lib-core';
import { CoordinateCalculator } from '../CoordinateCalculator';
import { LineChartState } from '../LineChartState';
import { RenderContext } from '../LineChart';

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
    const { innerHeight, innerWidth } = scales;

    const computedStyle = window.getComputedStyle(this.context.container);
    const inheritedFont = computedStyle.fontFamily || 'inherit';

    const xAxisTickSize = FontSizeHelper.getXAxisTickFontSize(this.config.fonts);
    const yAxisTickSize = FontSizeHelper.getYAxisTickFontSize(this.config.fonts);
    const xAxisLabelSize = FontSizeHelper.getXAxisLabelFontSize(this.config.fonts);
    const yAxisLabelSize = FontSizeHelper.getYAxisLabelFontSize(this.config.fonts);

    // X축 위치 설정
    const xAxisPosition = this.config.scale?.xAxisPosition || 'center';

    // X축 세부 표시 설정 (기본값: 모두 true)
    const xAxisDisplay = this.config.xAxisDisplay || {};
    const showXAxisLine = xAxisDisplay.showAxisLine !== false;
    const showXTicks = xAxisDisplay.showTicks !== false;
    const showXTickLabels = xAxisDisplay.showTickLabels !== false;

    // Y축 세부 표시 설정 (기본값: 모두 true)
    const yAxisDisplay = this.config.yAxisDisplay || {};
    const showYAxisLine = yAxisDisplay.showAxisLine !== false;
    const showYTicks = yAxisDisplay.showTicks !== false;
    const showYTickLabels = yAxisDisplay.showTickLabels !== false;

    // ============================================
    // X축 렌더링
    // ============================================
    if (this.config.showXAxis !== false) {
      let xAxisTransform = `translate(0, ${innerHeight})`;

      if (xAxisPosition === 'bottom') {
        xAxisTransform = `translate(0, ${innerHeight})`;
      } else if (xAxisPosition === 'top') {
        xAxisTransform = 'translate(0, 0)';
      } else {
        const zeroPos = scales.yScale(0);
        xAxisTransform = `translate(0, ${!isNaN(zeroPos) ? zeroPos : innerHeight})`;
      }

      const xAxisGroup = this.context.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', xAxisTransform)
        .call(xAxis);

      // X축 라인 제어
      if (!showXAxisLine) {
        xAxisGroup.select('.domain').style('display', 'none');
      }

      // X축 눈금 라인 제어
      if (!showXTicks || xAxisPosition === 'top' || xAxisPosition === 'bottom') {
        xAxisGroup.selectAll('.tick line').style('display', 'none');
      }

      // X축 눈금 텍스트 제어
      if (!showXTickLabels) {
        xAxisGroup.selectAll('.tick text').style('display', 'none');
      } else {
        xAxisGroup.selectAll('text')
          .style('font-family', inheritedFont)
          .attr('font-size', `${xAxisTickSize}px`)
          .attr('fill', '#111');
      }

      // X축 라벨
      if (this.config.xAxisLabel) {
        xAxisGroup.append('text')
          .attr('class', 'axis-label x-axis-label')
          .attr('x', innerWidth / 2)
          .attr('y', 35)
          .attr('text-anchor', 'middle')
          .style('font-family', inheritedFont)
          .attr('font-size', `${xAxisLabelSize}px`)
          .style('font-weight', '500')
          .attr('fill', '#111')
          .text(this.config.xAxisLabel);
      }
    }

    // ============================================
    // Y축 렌더링
    // ============================================
    if (this.config.showYAxis !== false) {
      // yAxisTickInterval 적용
      const yTickInterval = this.config.scale?.yAxisTickInterval;
      if (yTickInterval && yTickInterval > 0) {
        const domain = scales.yScale.domain();
        const [minVal, maxVal] = domain;

        const ticks: number[] = [];
        for (let val = minVal; val <= maxVal; val += yTickInterval) {
          ticks.push(val);
        }

        yAxis.tickValues(ticks);
      }

      const yAxisGroup = this.context.chartArea.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis);

      // Y축 라인 제어
      if (!showYAxisLine) {
        yAxisGroup.select('.domain').style('display', 'none');
      }

      // Y축 눈금 라인 제어
      if (!showYTicks) {
        yAxisGroup.selectAll('.tick line').style('display', 'none');
      }

      // Y축 눈금 텍스트 제어
      if (!showYTickLabels) {
        yAxisGroup.selectAll('.tick text').style('display', 'none');
      } else {
        yAxisGroup.selectAll('text')
          .style('font-family', inheritedFont)
          .attr('font-size', `${yAxisTickSize}px`)
          .attr('fill', '#111');
      }

      // Y축 라벨
      if (this.config.yAxisLabel) {
        yAxisGroup.append('text')
          .attr('class', 'axis-label y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -innerHeight / 2)
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

    // yAxisTickInterval 적용
    const yTickInterval = this.config.scale?.yAxisTickInterval;
    if (yTickInterval && yTickInterval > 0) {
      const domain = scales.yScale.domain();
      const [minVal, maxVal] = domain;

      const ticks: number[] = [];
      for (let val = minVal; val <= maxVal; val += yTickInterval) {
        ticks.push(val);
      }

      yAxis.tickValues(ticks);
    }

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