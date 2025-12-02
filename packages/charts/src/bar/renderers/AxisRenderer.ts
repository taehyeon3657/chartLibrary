/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BarChartConfig } from '@beaubrain/chart-lib-types';
import { FontSizeHelper } from '@beaubrain/chart-lib-core';
import type { CoordinateCalculator } from '../CoordinateCalculator';
import type { BarChartState } from '../BarChartState';
import { RenderContext } from '../BarChart';

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
    this.renderBaseline();
  }

  private clearPreviousRender(): void {
    this.context.chartArea.selectAll('.axis').remove();
    this.context.chartArea.selectAll('.grid').remove();
    this.context.chartArea.selectAll('.baseline').remove();
  }

  private renderAxes(): void {
    const axesData = this.calculator.calculateAxes();
    const scales = this.state.getScales();
    if (!axesData || !scales) return;

    const { xAxis, yAxis } = axesData;
    const { innerHeight, innerWidth } = scales;
    const orientation = this.config.orientation || 'vertical';

    const axisColor = this.config.axisColor || '#333';

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

      if (orientation === 'vertical') {
        if (xAxisPosition === 'bottom') {
          xAxisTransform = `translate(0, ${innerHeight})`;
        } else if (xAxisPosition === 'top') {
          xAxisTransform = 'translate(0, 0)';
        } else {
          const zeroPos = (scales.yScale as any)(0);
          xAxisTransform = `translate(0, ${!isNaN(zeroPos) ? zeroPos : innerHeight})`;
        }
      }

      if (orientation === 'horizontal') {
        xAxis.tickSizeOuter(0);
      }

      const xAxisGroup = this.context.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', xAxisTransform)
        .call(xAxis);

      // X축 라인 제어
      if (!showXAxisLine) {
        xAxisGroup.select('.domain').style('display', 'none');
      } else {
        if (orientation === 'vertical') {
          xAxisGroup.select('.domain')
            .attr('d', `M0,0H${innerWidth}`)
            .attr('stroke', axisColor);
        } else {
          xAxisGroup.select('.domain')
            .attr('d', `M0,0H${innerWidth}`)
            .attr('stroke', axisColor);
        }
      }

      // X축 눈금 라인 제어
      if (!showXTicks || xAxisPosition === 'top' || xAxisPosition === 'bottom') {
        xAxisGroup.selectAll('.tick line').style('display', 'none');
      } else {
        xAxisGroup.selectAll('.tick line').attr('stroke', axisColor);
      }

      // X축 눈금 텍스트 제어
      if (!showXTickLabels) {
        xAxisGroup.selectAll('.tick text').style('display', 'none');
      } else {
        xAxisGroup.selectAll('text')
          .style('font-family', inheritedFont)
          .attr('font-size', `${xAxisTickSize}px`)
          .attr('fill', axisColor);

        if (orientation === 'vertical' && (scales.xScale as any).bandwidth) {
          const bandwidth = (scales.xScale as any).bandwidth();
          xAxisGroup.selectAll('.tick text')
            .attr('transform', `translate(${bandwidth / 2}, 0)`);
        }
      }

      // Horizontal 모드 조정
      if (orientation === 'horizontal') {
        xAxisGroup.selectAll('.tick')
          .style('display', (d: any, i, nodes) => {
            if (i === 0 || i === nodes.length - 1) {
              return 'none';
            }
            if (d === 0 && this.config.showYAxisZero === false) {
              return 'none';
            }
            return null;
          });
      }

      // X축 라벨
      if (this.config.xAxisLabel) {
        const labelPosition = this.config.xAxisLabelPosition || 'center';
        let xPosition: number;
        let textAnchor: 'start' | 'middle' | 'end';

        if (labelPosition === 'left') {
          xPosition = 0;
          textAnchor = 'start';
        } else if (labelPosition === 'right') {
          xPosition = innerWidth;
          textAnchor = 'end';
        } else {
          xPosition = innerWidth / 2;
          textAnchor = 'middle';
        }

        xAxisGroup.append('text')
          .attr('class', 'axis-label x-axis-label')
          .attr('x', xPosition)
          .attr('y', 35)
          .attr('text-anchor', textAnchor)
          .attr('fill', axisColor)
          .style('font-family', inheritedFont)
          .attr('font-size', `${xAxisLabelSize}px`)
          .style('font-weight', '500')
          .text(this.config.xAxisLabel);
      }
    }

    // ============================================
    // Y축 렌더링
    // ============================================
    if (this.config.showYAxis !== false) {
      if (orientation === 'vertical') {
        yAxis.tickSizeOuter(0);
      }

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
      } else {
        if (orientation === 'horizontal') {
          yAxisGroup.select('.domain')
            .attr('d', `M0,0V${innerHeight}`)
            .attr('stroke', axisColor);
        } else {
          yAxisGroup.select('.domain').attr('stroke', axisColor);
        }
      }

      // Y축 눈금 라인 제어
      if (!showYTicks) {
        yAxisGroup.selectAll('.tick line').style('display', 'none');
      } else {
        if (orientation === 'vertical') {
          yAxisGroup.selectAll('.tick')
            .style('display', (d: any, i, nodes) => {
              if (i === 0 || i === nodes.length - 1) {
                return 'none';
              }
              if (d === 0 && this.config.showYAxisZero === false) {
                return 'none';
              }
              return null;
            });
        }
        yAxisGroup.selectAll('.tick line').attr('stroke', axisColor);
      }

      // Y축 눈금 텍스트 제어
      if (!showYTickLabels) {
        yAxisGroup.selectAll('.tick text').style('display', 'none');
      } else {
        yAxisGroup.selectAll('text')
          .style('font-family', inheritedFont)
          .attr('font-size', `${yAxisTickSize}px`)
          .attr('fill', axisColor);
      }

      // Y축 라벨
      if (this.config.yAxisLabel) {
        const labelPosition = this.config.yAxisLabelPosition || 'center';
        let yPosition: number;
        let textAnchor: 'start' | 'middle' | 'end';

        if (labelPosition === 'top') {
          yPosition = 0;
          textAnchor = 'start';
        } else if (labelPosition === 'bottom') {
          yPosition = innerHeight;
          textAnchor = 'end';
        } else {
          yPosition = innerHeight / 2;
          textAnchor = 'middle';
        }

        yAxisGroup.append('text')
          .attr('class', 'axis-label y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -yPosition)
          .attr('y', -40)
          .attr('text-anchor', textAnchor)
          .attr('fill', axisColor)
          .style('font-family', inheritedFont)
          .attr('font-size', `${yAxisLabelSize}px`)
          .style('font-weight', '500')
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

    if (this.config.horizontalGridLines !== false) {
      const horizontalGrid = this.context.chartArea.append('g')
        .attr('class', 'grid horizontal-grid')
        .attr('transform', orientation === 'vertical' ? `translate(0, ${innerHeight})` : '')
        .call(
          orientation === 'vertical'
            ? xAxis.tickSize(-innerHeight).tickFormat(() => '')
            : yAxis.tickSize(-innerWidth).tickFormat(() => '')
        );

      horizontalGrid.selectAll('line')
        .attr('stroke', gridColor)
        .attr('stroke-dasharray', dashArray);

      horizontalGrid.selectAll('text').remove();
      horizontalGrid.select('.domain').remove();
    }

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

      verticalGrid.selectAll('text').remove();
      verticalGrid.select('.domain').remove();
    }
  }

  private renderBaseline(): void {
    if (!this.config.showBaseline) return;

    const scales = this.state.getScales();
    if (!scales) return;

    const { yScale, innerWidth, innerHeight } = scales;
    const orientation = this.config.orientation || 'vertical';

    const baselineValue = this.config.baselineValue ?? 0;
    const baselineColor = this.config.baselineColor || '#333';
    const baselineWidth = this.config.baselineWidth || 2;
    const baselineStyle = this.config.baselineStyle || 'solid';
    const dashArray = baselineStyle === 'dashed' ? '4,4' : '0';

    if (orientation === 'vertical') {
      const yPosition = yScale(baselineValue);

      this.context.chartArea.append('line')
        .attr('class', 'baseline')
        .attr('x1', 0)
        .attr('y1', yPosition)
        .attr('x2', innerWidth)
        .attr('y2', yPosition)
        .attr('stroke', baselineColor)
        .attr('stroke-width', baselineWidth)
        .attr('stroke-dasharray', dashArray)
        .style('pointer-events', 'none')
        .lower();

    } else {
      const xPosition = yScale(baselineValue);

      this.context.chartArea.append('line')
        .attr('class', 'baseline')
        .attr('x1', xPosition)
        .attr('y1', 0)
        .attr('x2', xPosition)
        .attr('y2', innerHeight)
        .attr('stroke', baselineColor)
        .attr('stroke-width', baselineWidth)
        .attr('stroke-dasharray', dashArray)
        .style('pointer-events', 'none')
        .lower();
    }
  }
}