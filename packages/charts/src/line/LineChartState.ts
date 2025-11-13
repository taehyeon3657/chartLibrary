import type {
  ProcessedDataPoint,
} from '@beaubrain/types';
import type { ChartScales } from '../shared';

/**
 * LineChart의 모든 상태를 관리하는 클래스
 *
 * 책임:
 * - 데이터 상태 관리
 * - 그룹 표시/숨김 상태
 * - 스케일 정보 보관
 * - 렌더링 상태 추적
 */
export class LineChartState {
  private data: ProcessedDataPoint[] = [];
  private groupedData = new Map<string, ProcessedDataPoint[]>();
  private groups: string[] = [];
  private visibleGroups = new Set<string>();
  private scales: ChartScales | null = null;
  private scaleType: 'time' | 'linear' | 'ordinal' = 'time';
  private isRendered = false;

  // ============================================
  // 데이터 관련 메서드
  // ============================================

  setData(data: ProcessedDataPoint[]): void {
    this.data = data;
    this.updateGroupData();
    this.scaleType = this.detectScaleType();
  }

  getData(): ProcessedDataPoint[] {
    return [...this.data];
  }

  getGroupedData(): Map<string, ProcessedDataPoint[]> {
    return new Map(this.groupedData);
  }

  getGroups(): string[] {
    return [...this.groups];
  }

  private updateGroupData(): void {
    // 그룹별로 데이터 분류
    this.groupedData.clear();

    this.data.forEach(item => {
      const group = item.group;
      if (!this.groupedData.has(group)) {
        this.groupedData.set(group, []);
      }
      this.groupedData.get(group)!.push(item);
    });

    // 그룹 목록 업데이트
    this.groups = Array.from(this.groupedData.keys());

    // 초기에는 모든 그룹 표시
    if (this.visibleGroups.size === 0) {
      this.visibleGroups = new Set(this.groups);
    } else {
      // 기존 상태 유지하되, 새 그룹은 자동으로 표시
      this.groups.forEach(group => {
        if (!this.visibleGroups.has(group)) {
          this.visibleGroups.add(group);
        }
      });
    }
  }

  // ============================================
  // 그룹 표시/숨김 관련
  // ============================================

  toggleGroup(group: string): boolean {
    if (this.visibleGroups.has(group)) {
      this.visibleGroups.delete(group);
      return false; // 숨김
    } else {
      this.visibleGroups.add(group);
      return true; // 표시
    }
  }

  showGroup(group: string): void {
    this.visibleGroups.add(group);
  }

  hideGroup(group: string): void {
    this.visibleGroups.delete(group);
  }

  isGroupVisible(group: string): boolean {
    return this.visibleGroups.has(group);
  }

  getVisibleGroups(): Set<string> {
    return new Set(this.visibleGroups);
  }

  getVisibleData(): ProcessedDataPoint[] {
    return this.data.filter(d => this.visibleGroups.has(d.group));
  }

  // ============================================
  // 스케일 관련
  // ============================================

  setScales(scales: ChartScales): void {
    this.scales = scales;
  }

  getScales(): ChartScales | null {
    return this.scales;
  }

  getScaleType(): 'time' | 'linear' | 'ordinal' {
    return this.scaleType;
  }

  private detectScaleType(): 'time' | 'linear' | 'ordinal' {
    if (this.data.length === 0) return 'time';

    // 유효한 날짜가 있는지 확인
    const hasValidDates = this.data.some(d =>
      d.parsedDate &&
      !isNaN(d.parsedDate.getTime()) &&
      d.parsedDate.getFullYear() > 1900
    );

    if (hasValidDates) return 'time';

    // 숫자인지 확인
    const hasNumericX = this.data.some(d => typeof d.x === 'number');
    if (hasNumericX) return 'linear';

    return 'ordinal';
  }

  // ============================================
  // 렌더링 상태 관련
  // ============================================

  setRendered(rendered: boolean): void {
    this.isRendered = rendered;
  }

  isChartRendered(): boolean {
    return this.isRendered;
  }

  // ============================================
  // 통계 및 유틸리티
  // ============================================

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  getDataCount(): number {
    return this.data.length;
  }

  getVisibleDataCount(): number {
    return this.getVisibleData().length;
  }

  getDataExtent(): {
    xDomain: [Date, Date] | [number, number];
    yDomain: [number, number];
  } {
    if (this.data.length === 0) {
      return {
        xDomain: [new Date(), new Date()],
        yDomain: [0, 0]
      };
    }

    const visibleData = this.getVisibleData();

    // Y 도메인
    const yValues = visibleData.map(d => d.y);
    const yDomain = [
      Math.min(...yValues),
      Math.max(...yValues)
    ] as [number, number];

    // X 도메인 (타입에 따라 다름)
    let xDomain: [Date, Date] | [number, number];

    switch (this.scaleType) {
      case 'time':
        const dates = visibleData
          .map(d => d.parsedDate)
          .filter(d => d && !isNaN(d.getTime())) as Date[];
        xDomain = [
          new Date(Math.min(...dates.map(d => d.getTime()))),
          new Date(Math.max(...dates.map(d => d.getTime())))
        ];
        break;

      case 'linear':
        const xNumbers = visibleData.map(d => d.x as number);
        xDomain = [
          Math.min(...xNumbers),
          Math.max(...xNumbers)
        ];
        break;

      case 'ordinal':
        // 서수형의 경우 인덱스 기반 도메인
        xDomain = [0, visibleData.length - 1];
        break;
    }

    return { xDomain, yDomain };
  }

  // ============================================
  // 복제 및 직렬화
  // ============================================

  clone(): LineChartState {
    const cloned = new LineChartState();
    cloned.data = [...this.data];
    cloned.groupedData = new Map(this.groupedData);
    cloned.groups = [...this.groups];
    cloned.visibleGroups = new Set(this.visibleGroups);
    cloned.scales = this.scales;
    cloned.scaleType = this.scaleType;
    cloned.isRendered = this.isRendered;
    return cloned;
  }

  getSnapshot(): {
    dataCount: number;
    groups: string[];
    visibleGroups: string[];
    scaleType: string;
    isRendered: boolean;
  } {
    return {
      dataCount: this.data.length,
      groups: [...this.groups],
      visibleGroups: Array.from(this.visibleGroups),
      scaleType: this.scaleType,
      isRendered: this.isRendered
    };
  }
}