/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import type { BarChartConfig, ProcessedDataPoint } from '@beaubrain/chart-lib-types';
import type { BarChartState } from './BarChartState';

export interface BarPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  data: ProcessedDataPoint;
}

export interface CalculatedAxes {
  xAxis: d3.Axis<any>;
  yAxis: d3.Axis<d3.NumberValue>;
}

export interface LegendData {
  group: string;
  color: string;
  visible: boolean;
}

export class CoordinateCalculator {
  constructor(
    private state: BarChartState,
    private config: BarChartConfig
  ) {}

  calculateBarPositions(): Map<string, BarPosition[]> {
    const scales = this.state.getScales();
    if (!scales) return new Map();

    const stacked = this.config.stacked || false;
    const grouped = this.config.grouped && !stacked;

    if (stacked) {
      return this.calculateStackedBarPositions();
    } else if (grouped) {
      return this.calculateGroupedBarPositions();
    } else {
      return this.calculateSingleBarPositions();
    }
  }

  private calculateSingleBarPositions(): Map<string, BarPosition[]> {
    const scales = this.state.getScales();
    if (!scales) return new Map();

    const { xScale, yScale } = scales;
    const orientation = this.config.orientation || 'vertical';
    const visibleGroups = this.state.getVisibleGroups();
    const groupedData = this.state.getGroupedData();
    const positions = new Map<string, BarPosition[]>();

    const bandwidth = (xScale as any).bandwidth ? (xScale as any).bandwidth() : 50;
    const barWidth = this.calculateBarWidth(bandwidth, 1);

    this.state.getGroups().forEach(group => {
      if (!visibleGroups.has(group)) return;

      const groupData = groupedData.get(group) || [];
      const groupPositions: BarPosition[] = [];

      groupData.forEach(d => {
        const category = String(d.x);

        if (orientation === 'vertical') {
          const centerX = (this.getXPosition(category) + bandwidth / 2) - barWidth;


          const yZero = yScale(0);
          const yValue = yScale(d.y);  // 데이터 값의 y 좌표

          let y: number;
          let height: number;

          if (d.y >= 0) {
            // 양수: 0에서 시작해서 위로
            y = yValue;
            height = yZero - yValue;
          } else {
            // 음수: 0에서 시작해서 아래로
            y = yZero;
            height = yValue - yZero;
          }

          groupPositions.push({
            x: centerX,
            y,
            width: barWidth,
            height: Math.abs(height),
            data: d
          });
        } else {
          const centerY = this.getXPosition(category) + bandwidth / 2;
          const xZero = yScale(0);
          const xValue = yScale(d.y);

          let x: number;
          let width: number;

          if (d.y >= 0) {
            x = xZero;
            width = xValue - xZero;
          } else {
            x = xValue;
            width = xZero - xValue;
          }

          groupPositions.push({
            x,
            y: centerY - barWidth / 2,
            width: Math.abs(width),
            height: barWidth,
            data: d
          });
        }
      });

      if (groupPositions.length > 0) {
        positions.set(group, groupPositions);
      }
    });

    return positions;
  }

  private calculateGroupedBarPositions(): Map<string, BarPosition[]> {
    const scales = this.state.getScales();
    if (!scales) return new Map();

    const { xScale, yScale } = scales;
    const orientation = this.config.orientation || 'vertical';
    const visibleGroups = Array.from(this.state.getVisibleGroups());
    const categoryData = this.state.getCategoryData();
    const positions = new Map<string, BarPosition[]>();

    const bandwidth = (xScale as any).bandwidth ? (xScale as any).bandwidth() : 50;
    const groupCount = visibleGroups.length;
    const barWidth = this.calculateBarWidth(bandwidth, groupCount);
    const barGroupPadding = this.config.barGroupPadding || 0.1;

    const gapWidth = barWidth * barGroupPadding;
    const totalGapsWidth = gapWidth * (groupCount - 1);
    const totalGroupWidth = (barWidth * groupCount) + totalGapsWidth;
    const groupStartOffset = (bandwidth - totalGroupWidth) / 2;

    visibleGroups.forEach((group, groupIndex) => {
      const groupPositions: BarPosition[] = [];
      const offset = groupStartOffset + (groupIndex * (barWidth + gapWidth));

      this.state.getCategories().forEach(category => {
        const items = categoryData.get(category) || [];
        const item = items.find(d => d.group === group);

        if (!item) return;

        if (orientation === 'vertical') {
          const centerX = this.getXPosition(category) + offset;

          // 🔧 FIX: 음수/양수 값 처리
          const yZero = yScale(0);
          const yValue = yScale(item.y);

          let y: number;
          let height: number;

          if (item.y >= 0) {
            y = yValue;
            height = yZero - yValue;
          } else {
            y = yZero;
            height = yValue - yZero;
          }

          groupPositions.push({
            x: centerX,
            y,
            width: barWidth,
            height: Math.abs(height),
            data: item
          });
        } else {
          const xZero = yScale(0);
          const xValue = yScale(item.y);

          let x: number;
          let width: number;

          if (item.y >= 0) {
            x = xZero;
            width = xValue - xZero;
          } else {
            x = xValue;
            width = xZero - xValue;
          }

          groupPositions.push({
            x,
            y: this.getXPosition(category) + offset,
            width: Math.abs(width),
            height: barWidth,
            data: item
          });
        }
      });

      if (groupPositions.length > 0) {
        positions.set(group, groupPositions);
      }
    });

    return positions;
  }

  private calculateStackedBarPositions(): Map<string, BarPosition[]> {
    const scales = this.state.getScales();
    if (!scales) return new Map();

    const { xScale, yScale } = scales;
    const orientation = this.config.orientation || 'vertical';
    const stackedData = this.state.getStackedData();
    const positions = new Map<string, BarPosition[]>();

    const bandwidth = (xScale as any).bandwidth ? (xScale as any).bandwidth() : 50;
    const barWidth = this.calculateBarWidth(bandwidth, 1);
    const centerOffset = (bandwidth - barWidth) / 2;

    stackedData.forEach((data, group) => {
      const groupPositions: BarPosition[] = [];

      data.forEach(d => {
        if (orientation === 'vertical') {
          const x = this.getXPosition(d.category) + centerOffset;
          const y = yScale(d.y1);
          const height = yScale(d.y0) - y;

          groupPositions.push({
            x,
            y,
            width: barWidth,
            height: Math.abs(height),
            data: { ...d, y: d.value } as any
          });
        } else {
          const x = yScale(d.y0);
          const y = this.getXPosition(d.category) + centerOffset;
          const width = yScale(d.y1) - x;

          groupPositions.push({
            x,
            y,
            width: Math.abs(width),
            height: barWidth,
            data: { ...d, y: d.value } as any
          });
        }
      });

      if (groupPositions.length > 0) {
        positions.set(group, groupPositions);
      }
    });

    return positions;
  }

  calculateAxes(): CalculatedAxes | null {
    const scales = this.state.getScales();
    if (!scales) return null;

    const { xScale, yScale } = scales;
    const orientation = this.config.orientation || 'vertical';

    let xAxis: d3.Axis<any>;
    let yAxis: d3.Axis<d3.NumberValue>;

    if (orientation === 'vertical') {
      xAxis = d3.axisBottom(xScale as any);

      yAxis = d3.axisLeft(yScale);
      if (this.config.yAxisTickFormat) {
        yAxis.tickFormat(d3.format(this.config.yAxisTickFormat));
      }
      yAxis.ticks(Math.min(6, Math.floor(scales.innerHeight / 40)));
    } else {
      xAxis = d3.axisBottom(yScale);
      if (this.config.xAxisTickFormat) {
        xAxis.tickFormat(d3.format(this.config.xAxisTickFormat));
      }
      xAxis.ticks(Math.min(8, Math.floor(scales.innerWidth / 80)));

      yAxis = d3.axisLeft(xScale as any);
    }

    return { xAxis, yAxis };
  }

  calculateLegendData(): LegendData[] {
    const scales = this.state.getScales();
    if (!scales) return [];

    const { colorScale } = scales;
    const visibleGroups = this.state.getVisibleGroups();

    return this.state.getGroups().map(group => ({
      group,
      color: colorScale(group),
      visible: visibleGroups.has(group)
    }));
  }

  findBarAtPosition(x: number, y: number): ProcessedDataPoint | null {
    const barPositions = this.calculateBarPositions();

    for (const [group, positions] of barPositions) {
      for (const pos of positions) {
        if (
          x >= pos.x &&
          x <= pos.x + pos.width &&
          y >= pos.y &&
          y <= pos.y + pos.height
        ) {
          return pos.data;
        }
      }
    }

    return null;
  }

  private getXPosition(category: string): number {
    const scales = this.state.getScales();
    if (!scales) return 0;

    const { xScale } = scales;

    if ((xScale as any).bandwidth) {
      return (xScale as any)(category) || 0;
    } else {
      return (xScale as any)(category) || 0;
    }
  }

  private calculateBarWidth(bandwidth: number, groupCount: number): number {
    const barPadding = this.config.barPadding || 0.1;
    const availableWidth = bandwidth / groupCount;
    let barWidth = availableWidth * (1 - barPadding);

    if (this.config.barWidth) {
      barWidth = Math.min(this.config.barWidth, availableWidth);
    }

    if (this.config.minBarWidth) {
      barWidth = Math.max(barWidth, this.config.minBarWidth);
    }
    if (this.config.maxBarWidth) {
      barWidth = Math.min(barWidth, this.config.maxBarWidth);
    }

    return barWidth;
  }

  getChartBounds(): {
    width: number;
    height: number;
    innerWidth: number;
    innerHeight: number;
    margin: { top: number; right: number; bottom: number; left: number };
    } {
    const scales = this.state.getScales();
    const margin = this.config.margin || { top: 20, right: 20, bottom: 40, left: 60 };

    if (!scales) {
      return {
        width: this.config.width || 600,
        height: this.config.height || 400,
        innerWidth: (this.config.width || 600) - margin.left - margin.right,
        innerHeight: (this.config.height || 400) - margin.top - margin.bottom,
        margin
      };
    }

    return {
      width: this.config.width || 600,
      height: this.config.height || 400,
      innerWidth: scales.innerWidth,
      innerHeight: scales.innerHeight,
      margin
    };
  }
}