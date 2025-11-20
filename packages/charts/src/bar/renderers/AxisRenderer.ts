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

    // [수정] 색상 통일: config에 값이 없으면 기본값 '#333'(검은색 계열) 사용
    const axisColor = this.config.axisColor || '#333';

    // 부모 컨테이너의 실제 폰트 가져오기
    const computedStyle = window.getComputedStyle(this.context.container);
    const inheritedFont = computedStyle.fontFamily || 'inherit';

    // 🔧 FontSizeHelper로 폰트 사이즈 가져오기
    const xAxisTickSize = FontSizeHelper.getXAxisTickFontSize(this.config.fonts);
    const yAxisTickSize = FontSizeHelper.getYAxisTickFontSize(this.config.fonts);
    const xAxisLabelSize = FontSizeHelper.getXAxisLabelFontSize(this.config.fonts);
    const yAxisLabelSize = FontSizeHelper.getYAxisLabelFontSize(this.config.fonts);

    // X축 렌더링
    if (this.config.showXAxis) {
      // vertical 모드일 때 y=0 위치에 x축을 배치하도록 transform 계산 (이전 수정 사항 유지)
      let xAxisTransform = `translate(0, ${innerHeight})`;
      if (orientation === 'vertical') {
        const zeroPos = (scales.yScale as any)(0);
        xAxisTransform = `translate(0, ${!isNaN(zeroPos) ? zeroPos : innerHeight})`;
      }

      const xAxisGroup = this.context.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', xAxisTransform)
        .call(xAxis);

      // 🔧 X축 눈금 텍스트 스타일 적용 (색상 통일)
      xAxisGroup.selectAll('text')
        .style('font-family', inheritedFont)
        .attr('font-size', `${xAxisTickSize}px`)
        .attr('fill', axisColor); // #666 -> axisColor

      xAxisGroup.select('.domain')
        .attr('stroke', axisColor); // #111 -> axisColor

      xAxisGroup.selectAll('.tick line')
        .attr('stroke', axisColor); // #111 -> axisColor

      // scaleBand를 사용하는 경우, tick을 바의 중앙에 위치시킴
      if (orientation === 'vertical' && (scales.xScale as any).bandwidth) {
        const bandwidth = (scales.xScale as any).bandwidth();
        xAxisGroup.selectAll('.tick text')
          .attr('transform', `translate(${bandwidth / 2}, 0)`);
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
          .attr('fill', axisColor) // #666 -> axisColor
          .style('font-family', inheritedFont)
          .attr('font-size', `${xAxisLabelSize}px`)
          .style('font-weight', '500')
          .text(this.config.xAxisLabel);
      }
    }

    // Y축 렌더링
    if (this.config.showYAxis) {
      // tickSizeOuter(0)을 호출하여 축 양 끝단의 값 없는 눈금 제거 (이전 수정 사항 유지)
      yAxis.tickSizeOuter(0);

      const yAxisGroup = this.context.chartArea.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis);

      yAxisGroup.selectAll('.tick')
        .style('display', (d: any, i, nodes) => {
          // 1. 제일 위 눈금은 항상 숨김
          if (i === nodes.length - 1) {
            return 'none';
          }
          // 2. 값이 0인 눈금은 props에 따라 제어
          if (d === 0 && this.config.showYAxisZero === false) {
            return 'none';
          }
          return null;
        });

      // Y축 눈금 텍스트 스타일 적용 (색상 통일)
      yAxisGroup.selectAll('text')
        .style('font-family', inheritedFont)
        .attr('font-size', `${yAxisTickSize}px`)
        .attr('fill', axisColor); // #666 -> axisColor

      yAxisGroup.select('.domain')
        .attr('stroke', axisColor); // #111 -> axisColor

      yAxisGroup.selectAll('.tick line')
        .attr('stroke', axisColor); // #111 -> axisColor

      // horizontal orientation이고 scaleBand인 경우
      if (orientation === 'horizontal' && (scales.xScale as any).bandwidth) {
        const bandwidth = (scales.xScale as any).bandwidth();
        yAxisGroup.selectAll('.tick text')
          .attr('transform', `translate(0, ${bandwidth / 2})`);
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
          .attr('fill', axisColor) // #666 -> axisColor
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
      horizontalGrid.select('.domain').remove(); // 그리드 라인의 축 선 제거
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
      verticalGrid.select('.domain').remove(); // 그리드 라인의 축 선 제거
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