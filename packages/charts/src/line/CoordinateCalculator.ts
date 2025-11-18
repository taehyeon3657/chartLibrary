/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import { RenderingUtils } from '../shared';
import type { LineChartConfig, ProcessedDataPoint } from '@beaubrain/chart-lib-types';
import type { LineChartState } from './LineChartState';

/**
 * LineChart의 모든 좌표 계산을 담당하는 클래스
 *
 * 책임:
 * - 라인 경로 계산
 * - 영역 경로 계산
 * - 점 위치 계산
 * - 히트 테스트 (마우스 위치에서 데이터 찾기)
 * - 축 설정 계산
 * - 범례 데이터 계산
 * - 좌표 변환 유틸리티
 */

export interface DotPosition {
  x: number;
  y: number;
  data: ProcessedDataPoint;
}

export interface CalculatedAxes {
  xAxis: d3.Axis<unknown>;
  yAxis: d3.Axis<d3.NumberValue>;
}

export interface LegendData {
  group: string;
  color: string;
  visible: boolean;
}

export class CoordinateCalculator {
  constructor(
    private state: LineChartState,
    private config: LineChartConfig
  ) {}

  // ============================================
  // 라인 경로 계산
  // ============================================

  /**
   * 모든 가시 그룹의 라인 경로 계산
   */
  calculateLinePaths(): Map<string, string> {
    const scales = this.state.getScales();
    if (!scales) return new Map();

    const visibleGroups = this.state.getVisibleGroups();
    const groupedData = this.state.getGroupedData();
    const { yScale } = scales;

    const curveFactory = this.config.enableCurve
      ? RenderingUtils.getCurveFactory(this.config.curveType || 'monotoneX')
      : d3.curveLinear;

    const line = d3.line<ProcessedDataPoint>()
      .x(d => this.getXCoordinate(d))
      .y(d => yScale(d.y))
      .curve(curveFactory)
      .defined(d => !isNaN(d.y) && isFinite(d.y)); // NaN, Infinity 값 제외

    const paths = new Map<string, string>();

    this.state.getGroups().forEach(group => {
      if (!visibleGroups.has(group)) return;

      const groupData = groupedData.get(group) || [];
      if (groupData.length === 0) return;

      // 유효한 데이터만 필터링
      const validData = groupData.filter(d =>
        !isNaN(d.y) && isFinite(d.y) && this.isValidXCoordinate(d)
      );

      if (validData.length === 0) return;

      const pathString = line(validData);
      if (pathString) {
        paths.set(group, pathString);
      }
    });

    return paths;
  }

  // ============================================
  // 영역 경로 계산
  // ============================================

  /**
   * 모든 가시 그룹의 영역 경로 계산
   */
  calculateAreaPaths(): Map<string, string> {
    const scales = this.state.getScales();
    if (!scales) return new Map();

    const visibleGroups = this.state.getVisibleGroups();
    const groupedData = this.state.getGroupedData();
    const { yScale } = scales;

    const curveFactory = this.config.enableCurve
      ? RenderingUtils.getCurveFactory(this.config.curveType || 'monotoneX')
      : d3.curveLinear;

    const area = d3.area<ProcessedDataPoint>()
      .x(d => this.getXCoordinate(d))
      .y0(yScale(0))
      .y1(d => yScale(d.y))
      .curve(curveFactory)
      .defined(d => !isNaN(d.y) && isFinite(d.y));

    const paths = new Map<string, string>();

    this.state.getGroups().forEach(group => {
      if (!visibleGroups.has(group)) return;

      const groupData = groupedData.get(group) || [];
      if (groupData.length === 0) return;

      // 유효한 데이터만 필터링
      const validData = groupData.filter(d =>
        !isNaN(d.y) && isFinite(d.y) && this.isValidXCoordinate(d)
      );

      if (validData.length === 0) return;

      const pathString = area(validData);
      if (pathString) {
        paths.set(group, pathString);
      }
    });

    return paths;
  }

  // ============================================
  // 점 위치 계산
  // ============================================

  /**
   * 모든 가시 그룹의 점 위치 계산
   */
  calculateDotPositions(): Map<string, DotPosition[]> {
    const scales = this.state.getScales();
    if (!scales) return new Map();

    const visibleGroups = this.state.getVisibleGroups();
    const groupedData = this.state.getGroupedData();
    const { yScale } = scales;
    const positions = new Map<string, DotPosition[]>();

    this.state.getGroups().forEach(group => {
      if (!visibleGroups.has(group)) return;

      const groupData = groupedData.get(group) || [];

      const groupPositions = groupData
        .filter(d => !isNaN(d.y) && isFinite(d.y) && this.isValidXCoordinate(d))
        .map(d => ({
          x: this.getXCoordinate(d),
          y: yScale(d.y),
          data: d
        }))
        .filter(pos => !isNaN(pos.x) && !isNaN(pos.y)); // 최종 좌표 검증

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
    const scaleType = this.state.getScaleType();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let xAxis: d3.Axis<any>;

    // 스케일 타입에 따른 X축 설정
    switch (scaleType) {
    case 'time':
      xAxis = d3.axisBottom(xScale as d3.AxisScale<d3.AxisDomain>);
      if (this.config.xAxisTickFormat) {
        xAxis.tickFormat(d3.timeFormat(this.config.xAxisTickFormat));
      }
      // 자동 틱 개수 조정
      if (scales.innerWidth < 400) {
        xAxis.ticks(4);
      } else if (scales.innerWidth < 600) {
        xAxis.ticks(6);
      }
      break;

    case 'linear':
      xAxis = d3.axisBottom(xScale as any);
      if (this.config.xAxisTickFormat) {
        xAxis.tickFormat(d3.format(this.config.xAxisTickFormat));
      }
      // 자동 틱 개수 조정
      xAxis.ticks(Math.min(8, Math.floor(scales.innerWidth / 80)));
      break;

    case 'ordinal': {
      xAxis = d3.axisBottom(xScale as any);
      // 서수형의 경우 모든 값 표시하되, 너무 많으면 간격 조정
      const domain = (xScale as any).domain();
      if (domain.length > 10) {
        xAxis.tickValues(domain.filter((_: any, i: number) => i % Math.ceil(domain.length / 10) === 0));
      }
      break;
    }

    default:
      xAxis = d3.axisBottom(xScale as any);
    }

    // Y축 설정
    const yAxis = d3.axisLeft(yScale);
    if (this.config.yAxisTickFormat) {
      yAxis.tickFormat(d3.format(this.config.yAxisTickFormat));
    }

    // Y축 틱 개수 조정
    yAxis.ticks(Math.min(6, Math.floor(scales.innerHeight / 40)));

    return { xAxis, yAxis };
  }

  // ============================================
  // 범례 데이터 계산
  // ============================================

  /**
   * 범례 렌더링에 필요한 데이터 계산
   */
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
  // 히트 테스트 (마우스 위치에서 데이터 찾기)
  // ============================================

  /**
   * 주어진 화면 좌표에서 가장 가까운 데이터 포인트 찾기
   */
  findDataAtPosition(x: number, y: number): ProcessedDataPoint | null {
    const scales = this.state.getScales();
    if (!scales) return null;

    const { yScale } = scales;
    const visibleGroups = this.state.getVisibleGroups();
    const threshold = (this.config.dotRadius || 4) + 5;

    let closestData: ProcessedDataPoint | null = null;
    let minDistance = Infinity;

    this.state.getVisibleData().forEach(d => {
      if (!visibleGroups.has(d.group)) return;
      if (!this.isValidDataPoint(d)) return;

      const dotX = this.getXCoordinate(d);
      const dotY = yScale(d.y);

      // NaN 체크
      if (isNaN(dotX) || isNaN(dotY)) return;

      const distance = Math.sqrt(
        Math.pow(x - dotX, 2) + Math.pow(y - dotY, 2)
      );

      if (distance < threshold && distance < minDistance) {
        minDistance = distance;
        closestData = d;
      }
    });

    return closestData;
  }

  /**
   * X축 기준으로 가장 가까운 데이터 포인트 찾기 (세로선 호버용)
   */
  findNearestDataPointByX(targetX: number): ProcessedDataPoint | null {
    const visibleData = this.state.getVisibleData().filter(d => this.isValidDataPoint(d));
    if (visibleData.length === 0) return null;

    let nearestData: ProcessedDataPoint | null = null;
    let minDistance = Infinity;

    visibleData.forEach(d => {
      const x = this.getXCoordinate(d);
      if (isNaN(x)) return;

      const distance = Math.abs(x - targetX);

      if (distance < minDistance) {
        minDistance = distance;
        nearestData = d;
      }
    });

    return nearestData;
  }

  // ============================================
  // 범위 기반 데이터 필터링
  // ============================================

  /**
   * 주어진 화면 좌표 범위 내의 데이터 찾기 (브러시/줌 기능용)
   */
  getDataInRange(
    xStart: number,
    xEnd: number,
    yStart?: number,
    yEnd?: number
  ): ProcessedDataPoint[] {
    const scales = this.state.getScales();
    if (!scales) return [];

    const { yScale } = scales;
    const visibleData = this.state.getVisibleData().filter(d => this.isValidDataPoint(d));

    return visibleData.filter(d => {
      const x = this.getXCoordinate(d);
      const y = yScale(d.y);

      if (isNaN(x) || isNaN(y)) return false;

      const inXRange = x >= Math.min(xStart, xEnd) && x <= Math.max(xStart, xEnd);

      if (yStart !== undefined && yEnd !== undefined) {
        const inYRange = y >= Math.min(yStart, yEnd) && y <= Math.max(yStart, yEnd);
        return inXRange && inYRange;
      }

      return inXRange;
    });
  }

  // ============================================
  // 좌표 변환 유틸리티
  // ============================================

  /**
   * 화면 좌표를 데이터 좌표로 변환
   */
  screenToDataCoordinates(screenX: number, screenY: number): {
    x: Date | number | string;
    y: number;
  } | null {
    const scales = this.state.getScales();
    if (!scales) return null;

    const { xScale, yScale } = scales;
    const scaleType = this.state.getScaleType();

    let x: Date | number | string;

    try {
      switch (scaleType) {
      case 'time':
        x = (xScale as any).invert(screenX);
        break;
      case 'linear':
        x = (xScale as any).invert(screenX);
        break;
      case 'ordinal':
        // 서수 스케일의 경우 가장 가까운 값 찾기
        const domain = (xScale as any).domain();
        const range = (xScale as any).range();
        let minDist = Infinity;
        let closestValue = domain[0];

        domain.forEach((val: string, i: number) => {
          const dist = Math.abs(range[i] - screenX);
          if (dist < minDist) {
            minDist = dist;
            closestValue = val;
          }
        });
        x = closestValue;
        break;
      default:
        x = 0;
      }

      const y = yScale.invert(screenY);

      return { x, y };
    } catch (error) {
      console.warn('Failed to convert screen coordinates to data coordinates:', error);
      return null;
    }
  }

  /**
   * 데이터 좌표를 화면 좌표로 변환
   */
  dataToScreenCoordinates(dataPoint: ProcessedDataPoint): { x: number; y: number } | null {
    const scales = this.state.getScales();
    if (!scales || !this.isValidDataPoint(dataPoint)) return null;

    const { yScale } = scales;

    try {
      const x = this.getXCoordinate(dataPoint);
      const y = yScale(dataPoint.y);

      if (isNaN(x) || isNaN(y)) return null;

      return { x, y };
    } catch (error) {
      console.warn('Failed to convert data coordinates to screen coordinates:', error);
      return null;
    }
  }

  // ============================================
  // 차트 정보 및 통계
  // ============================================

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

  /**
   * 가시 데이터의 통계 정보
   */
  getVisibleDataStats(): {
    totalPoints: number;
    groupCounts: Map<string, number>;
    xRange: [Date | number, Date | number] | null;
    yRange: [number, number] | null;
    } {
    const visibleData = this.state.getVisibleData().filter(d => this.isValidDataPoint(d));
    const groupCounts = new Map<string, number>();

    // 그룹별 카운트
    visibleData.forEach(d => {
      const current = groupCounts.get(d.group) || 0;
      groupCounts.set(d.group, current + 1);
    });

    // 범위 계산
    let xRange: [Date | number, Date | number] | null = null;
    let yRange: [number, number] | null = null;

    if (visibleData.length > 0) {
      const scaleType = this.state.getScaleType();
      const yValues = visibleData.map(d => d.y);

      yRange = [Math.min(...yValues), Math.max(...yValues)];

      if (scaleType === 'time') {
        const dates = visibleData.map(d => d.parsedDate).filter(d => d && !isNaN(d.getTime()));
        if (dates.length > 0) {
          xRange = [
            new Date(Math.min(...dates.map(d => d.getTime()))),
            new Date(Math.max(...dates.map(d => d.getTime())))
          ];
        }
      } else if (scaleType === 'linear') {
        const xNumbers = visibleData.map(d => d.x as number).filter(x => !isNaN(x));
        if (xNumbers.length > 0) {
          xRange = [Math.min(...xNumbers), Math.max(...xNumbers)];
        }
      }
    }

    return {
      totalPoints: visibleData.length,
      groupCounts,
      xRange,
      yRange
    };
  }

  // ============================================
  // Private 헬퍼 메서드들
  // ============================================

  /**
   * 스케일 타입에 따른 X 좌표 계산
   */
  private getXCoordinate = (d: ProcessedDataPoint): number => {
    const scales = this.state.getScales();
    if (!scales) return 0;

    const { xScale } = scales;
    const scaleType = this.state.getScaleType();

    try {
      switch (scaleType) {
      case 'time':
        return (xScale as any)(d.parsedDate);
      case 'linear':
        return (xScale as any)(d.x as number);
      case 'ordinal':
        return (xScale as any)(String(d.x));
      default:
        return 0;
      }
    } catch (error) {
      console.warn('Failed to calculate X coordinate for data point:', d, error);
      return 0;
    }
  };

  /**
   * X 좌표 계산이 유효한지 확인
   */
  private isValidXCoordinate(d: ProcessedDataPoint): boolean {
    const scaleType = this.state.getScaleType();

    switch (scaleType) {
    case 'time':
      return d.parsedDate && !isNaN(d.parsedDate.getTime());
    case 'linear':
      return typeof d.x === 'number' && !isNaN(d.x) && isFinite(d.x);
    case 'ordinal':
      return d.x !== undefined && d.x !== null;
    default:
      return false;
    }
  }

  /**
   * 데이터 포인트가 유효한지 전체 검증
   */
  private isValidDataPoint(d: ProcessedDataPoint): boolean {
    return (
      d &&
      !isNaN(d.y) &&
      isFinite(d.y) &&
      this.isValidXCoordinate(d) &&
      d.group !== undefined
    );
  }
}