/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BarChartConfig } from '@beaubrain/chart-lib-types';
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
    this.renderBaseline(); // 기준선 렌더링 추가
  }

  private clearPreviousRender(): void {
    this.context.chartArea.selectAll('.axis').remove();
    this.context.chartArea.selectAll('.grid').remove();
    this.context.chartArea.selectAll('.baseline').remove(); // 기준선 제거 추가
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

      // scaleBand를 사용하는 경우, tick을 바의 중앙에 위치시킴
      if (orientation === 'vertical' && (scales.xScale as any).bandwidth) {
        const bandwidth = (scales.xScale as any).bandwidth();
        xAxisGroup.selectAll('.tick text')
          .attr('transform', `translate(${bandwidth / 2}, 0)`);
      }

      // X축 라벨 - 수정됨!
      if (this.config.xAxisLabel) {
        // labelPosition이 undefined면 'center'가 기본값
        const labelPosition = this.config.xAxisLabelPosition || 'center';

        let xPosition: number;
        let textAnchor: 'start' | 'middle' | 'end';

        // 문제 해결: switch 문 외부에서 default 처리
        if (labelPosition === 'left') {
          xPosition = 0;
          textAnchor = 'start';
        } else if (labelPosition === 'right') {
          xPosition = innerWidth;
          textAnchor = 'end';
        } else {
          // 'center' 또는 기타 값
          xPosition = innerWidth / 2;
          textAnchor = 'middle';
        }

        xAxisGroup.append('text')
          .attr('class', 'axis-label x-axis-label')
          .attr('x', xPosition)
          .attr('y', 35)
          .attr('text-anchor', textAnchor)
          .attr('fill', this.config.axisColor || '#666')
          .style('font-size', '12px')
          .style('font-weight', '500')
          .text(this.config.xAxisLabel);
      }
    }

    // Y축 렌더링
    if (this.config.showYAxis) {
      const yAxisGroup = this.context.chartArea.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis);

      // horizontal orientation이고 scaleBand인 경우
      if (orientation === 'horizontal' && (scales.xScale as any).bandwidth) {
        const bandwidth = (scales.xScale as any).bandwidth();
        yAxisGroup.selectAll('.tick text')
          .attr('transform', `translate(0, ${bandwidth / 2})`);
      }

      // Y축 라벨 - 수정됨!
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
          // 'center' 또는 기타 값
          yPosition = innerHeight / 2;
          textAnchor = 'middle';
        }

        yAxisGroup.append('text')
          .attr('class', 'axis-label y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -yPosition)
          .attr('y', -40)
          .attr('text-anchor', textAnchor)
          .attr('fill', this.config.axisColor || '#666')
          .style('font-size', '12px')
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

    // 가로 격자선
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

      verticalGrid.selectAll('text').remove();
    }
  }

  private renderBaseline(): void {
    if (!this.config.showBaseline) return;

    const scales = this.state.getScales();
    if (!scales) return;

    const { yScale, innerWidth, innerHeight } = scales;
    const orientation = this.config.orientation || 'vertical';

    // 기준선 설정
    const baselineValue = this.config.baselineValue ?? 0;
    const baselineColor = this.config.baselineColor || '#333';
    const baselineWidth = this.config.baselineWidth || 2;
    const baselineStyle = this.config.baselineStyle || 'solid';
    const dashArray = baselineStyle === 'dashed' ? '4,4' : '0';

    if (orientation === 'vertical') {
      // 세로 바 차트: y = 0 (또는 baselineValue) 위치에 가로선
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
        .style('pointer-events', 'none') // 마우스 이벤트 무시
        .lower(); // 바 뒤로 보내기

    } else {
      // 가로 바 차트: x = 0 (또는 baselineValue) 위치에 세로선
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