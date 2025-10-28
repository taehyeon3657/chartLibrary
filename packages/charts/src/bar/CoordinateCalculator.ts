import * as d3 from 'd3';
import type { BarChartConfig, ProcessedDataPoint } from '@charts-library/types';
import type { BarChartState } from './BarChartState';

/**
 * BarChart의 모든 좌표 계산을 담당하는 클래스
 *
 * 책임:
 * - 바 위치 및 크기 계산
 * - 축 설정 계산
 * - 범례 데이터 계산
 * - 히트 테스트
 */

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

  // ============================================
  // 바 위치 계산
  // ============================================

  /**
   * 모든 가시 그룹의 바 위치 계산
   */
  calculateBarPositions(): Map<string, BarPosition[]> {
    const scales = this.state.getScales();
    if (!scales) return new Map();

    const orientation = this.config.orientation || 'vertical';
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

  /**
   * 단일 바 위치 계산 (그룹별로 하나의 바만)
   */
  private calculateSingleBarPositions(): Map<string, BarPosition[]> {
    const scales = this.state.getScales();
    if (!scales) return new Map();

    const { xScale, yScale } = scales;
    const orientation = this.config.orientation || 'vertical';
    const visibleGroups = this.state.getVisibleGroups();
    const groupedData = this.state.getGroupedData();
    const positions = new Map<string, BarPosition[]>();

    // scaleBand 타입 체크 및 bandwidth 계산
    const bandwidth = (xScale as any).bandwidth ? (xScale as any).bandwidth() : 50;
    const barWidth = this.calculateBarWidth(bandwidth, 1);

    this.state.getGroups().forEach(group => {
      if (!visibleGroups.has(group)) return;

      const groupData = groupedData.get(group) || [];
      const groupPositions: BarPosition[] = [];

      groupData.forEach(d => {
        const category = String(d.x);

        if (orientation === 'vertical') {
          // 세로 바 (위로 그려짐)
          const x = this.getXPosition(category) + (bandwidth - barWidth) / 2;
          const y = yScale(d.y);
          const height = yScale(0) - y;

          groupPositions.push({
            x,
            y,
            width: barWidth,
            height: Math.abs(height),
            data: d
          });
        } else {
          // 가로 바 (오른쪽으로 그려짐)
          const x = yScale(0);
          const y = this.getXPosition(category) + (bandwidth - barWidth) / 2;
          const width = yScale(d.y) - x;

          groupPositions.push({
            x,
            y,
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

  /**
   * 그룹화된 바 위치 계산
   */
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
    const groupOffsets = this.state.getGroupOffsets(bandwidth);

    visibleGroups.forEach(group => {
      const groupPositions: BarPosition[] = [];
      const offset = groupOffsets.get(group) || 0;

      this.state.getCategories().forEach(category => {
        const items = categoryData.get(category) || [];
        const item = items.find(d => d.group === group);

        if (!item) return;

        if (orientation === 'vertical') {
          const x = this.getXPosition(category) + offset + (bandwidth / groupCount - barWidth) / 2;
          const y = yScale(item.y);
          const height = yScale(0) - y;

          groupPositions.push({
            x,
            y,
            width: barWidth,
            height: Math.abs(height),
            data: item
          });
        } else {
          const x = yScale(0);
          const y = this.getXPosition(category) + offset + (bandwidth / groupCount - barWidth) / 2;
          const width = yScale(item.y) - x;

          groupPositions.push({
            x,
            y,
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

  /**
   * 누적 바 위치 계산
   */
  private calculateStackedBarPositions(): Map<string, BarPosition[]> {
    const scales = this.state.getScales();
    if (!scales) return new Map();

    const { xScale, yScale } = scales;
    const orientation = this.config.orientation || 'vertical';
    const stackedData = this.state.getStackedData();
    const positions = new Map<string, BarPosition[]>();

    const bandwidth = (xScale as any).bandwidth ? (xScale as any).bandwidth() : 50;
    const barWidth = this.calculateBarWidth(bandwidth, 1);

    stackedData.forEach((data, group) => {
      const groupPositions: BarPosition[] = [];

      data.forEach(d => {
        if (orientation === 'vertical') {
          const x = this.getXPosition(d.category) + (bandwidth - barWidth) / 2;
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
          const y = this.getXPosition(d.category) + (bandwidth - barWidth) / 2;
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

  // ============================================
  // 축 계산
  // ============================================

  /**
   * X축과 Y축 설정 계산
   */
  calculateAxes(): CalculatedAxes | null {
    const scales = this.state.getScales();
    if (!scales) return null;

    const { xScale, yScale } = scales;
    const orientation = this.config.orientation || 'vertical';

    let xAxis: d3.Axis<any>;
    let yAxis: d3.Axis<d3.NumberValue>;

    if (orientation === 'vertical') {
      // 세로 바: X축은 카테고리, Y축은 값
      xAxis = d3.axisBottom(xScale as any);

      yAxis = d3.axisLeft(yScale);
      if (this.config.yAxisTickFormat) {
        yAxis.tickFormat(d3.format(this.config.yAxisTickFormat));
      }
      yAxis.ticks(Math.min(6, Math.floor(scales.innerHeight / 40)));
    } else {
      // 가로 바: X축은 값, Y축은 카테고리
      xAxis = d3.axisBottom(yScale);
      if (this.config.xAxisTickFormat) {
        xAxis.tickFormat(d3.format(this.config.xAxisTickFormat));
      }
      xAxis.ticks(Math.min(8, Math.floor(scales.innerWidth / 80)));

      yAxis = d3.axisLeft(xScale as any);
    }

    return { xAxis, yAxis };
  }

  // ============================================
  // 범례 데이터 계산
  // ============================================

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

  // ============================================
  // 히트 테스트
  // ============================================

  /**
   * 주어진 화면 좌표에서 바 찾기
   */
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

  // ============================================
  // 헬퍼 메서드들
  // ============================================

  /**
   * 카테고리의 X 위치 계산
   */
  private getXPosition(category: string): number {
    const scales = this.state.getScales();
    if (!scales) return 0;

    const { xScale } = scales;

    if ((xScale as any).bandwidth) {
      // scaleBand
      return (xScale as any)(category) || 0;
    } else {
      // scaleLinear or scaleTime
      return (xScale as any)(category) || 0;
    }
  }

  /**
   * 바 너비 계산
   */
  private calculateBarWidth(bandwidth: number, groupCount: number): number {
    const barPadding = this.config.barPadding || 0.1;
    const availableWidth = bandwidth / groupCount;
    let barWidth = availableWidth * (1 - barPadding);

    // 사용자 지정 너비
    if (this.config.barWidth) {
      barWidth = Math.min(this.config.barWidth, availableWidth);
    }

    // 최소/최대 너비 제한
    if (this.config.minBarWidth) {
      barWidth = Math.max(barWidth, this.config.minBarWidth);
    }
    if (this.config.maxBarWidth) {
      barWidth = Math.min(barWidth, this.config.maxBarWidth);
    }

    return barWidth;
  }

  /**
   * 차트 영역 경계 정보
   */
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