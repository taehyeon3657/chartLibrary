import type { ProcessedDataPoint } from '@beaubrain/chart-lib-types';
import type { ChartScales } from '../shared';

/**
 * BarChart의 모든 상태를 관리하는 클래스
 *
 * 책임:
 * - 데이터 상태 관리
 * - 그룹 표시/숨김 상태
 * - 스케일 정보 보관
 * - 렌더링 상태 추적
 */
export class BarChartState {
  private data: ProcessedDataPoint[] = [];
  private groupedData = new Map<string, ProcessedDataPoint[]>();
  private categoryData = new Map<string, ProcessedDataPoint[]>(); // 카테고리별 데이터
  private groups: string[] = [];
  private categories: string[] = []; // x축 카테고리들
  private visibleGroups = new Set<string>();
  private scales: ChartScales | null = null;
  private scaleType: 'time' | 'linear' | 'ordinal' = 'ordinal'; // bar는 주로 ordinal
  private isRendered = false;

  // ============================================
  // 데이터 관련 메서드
  // ============================================

  setData(data: ProcessedDataPoint[]): void {
    this.data = data;
    this.updateGroupData();
    this.updateCategoryData();
    this.scaleType = this.detectScaleType();
  }

  getData(): ProcessedDataPoint[] {
    return [...this.data];
  }

  getGroupedData(): Map<string, ProcessedDataPoint[]> {
    return new Map(this.groupedData);
  }

  getCategoryData(): Map<string, ProcessedDataPoint[]> {
    return new Map(this.categoryData);
  }

  getGroups(): string[] {
    return [...this.groups];
  }

  getCategories(): string[] {
    return [...this.categories];
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

  private updateCategoryData(): void {
    // 카테고리(x축 값)별로 데이터 분류
    this.categoryData.clear();

    this.data.forEach(item => {
      const category = String(item.x);
      if (!this.categoryData.has(category)) {
        this.categoryData.set(category, []);
      }
      this.categoryData.get(category)!.push(item);
    });

    // 카테고리 목록 업데이트 (정렬)
    this.categories = Array.from(this.categoryData.keys()).sort();
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
    if (this.data.length === 0) return 'ordinal';

    // Bar chart는 일반적으로 카테고리형(ordinal)
    // 하지만 x가 숫자라면 linear도 가능
    const hasNumericX = this.data.every(d => typeof d.x === 'number');
    if (hasNumericX) return 'linear';

    const hasValidDates = this.data.some(d =>
      d.parsedDate &&
      !isNaN(d.parsedDate.getTime()) &&
      d.parsedDate.getFullYear() > 1900
    );
    if (hasValidDates) return 'time';

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
    xDomain: string[];
    yDomain: [number, number];
    } {
    if (this.data.length === 0) {
      return {
        xDomain: [],
        yDomain: [0, 0]
      };
    }

    const visibleData = this.getVisibleData();

    // X 도메인 (카테고리들)
    const xDomain = [...new Set(visibleData.map(d => String(d.x)))].sort();

    // Y 도메인
    const yValues = visibleData.map(d => d.y);
    const yDomain = [
      Math.min(0, ...yValues), // 0을 포함
      Math.max(...yValues)
    ] as [number, number];

    return { xDomain, yDomain };
  }

  /**
   * Stacked bar를 위한 누적 데이터 계산
   */
  getStackedData(): Map<string, Array<{ category: string; y0: number; y1: number; value: number; group: string }>> {
    const stackedData = new Map<string, Array<{ category: string; y0: number; y1: number; value: number; group: string }>>();

    // 카테고리별로 누적 계산
    this.categories.forEach(category => {
      const categoryItems = this.categoryData.get(category) || [];
      let cumulative = 0;

      this.groups.forEach(group => {
        if (!this.visibleGroups.has(group)) return;

        const item = categoryItems.find(d => d.group === group);
        const value = item?.y || 0;

        if (!stackedData.has(group)) {
          stackedData.set(group, []);
        }

        stackedData.get(group)!.push({
          category,
          y0: cumulative,
          y1: cumulative + value,
          value,
          group
        });

        cumulative += value;
      });
    });

    return stackedData;
  }

  /**
   * Grouped bar를 위한 그룹 오프셋 계산
   */
  getGroupOffsets(bandwidth: number): Map<string, number> {
    const offsets = new Map<string, number>();
    const visibleGroups = Array.from(this.visibleGroups);
    const groupCount = visibleGroups.length;
    const groupWidth = bandwidth / groupCount;

    visibleGroups.forEach((group, index) => {
      offsets.set(group, index * groupWidth);
    });

    return offsets;
  }

  // ============================================
  // 복제 및 직렬화
  // ============================================

  clone(): BarChartState {
    const cloned = new BarChartState();
    cloned.data = [...this.data];
    cloned.groupedData = new Map(this.groupedData);
    cloned.categoryData = new Map(this.categoryData);
    cloned.groups = [...this.groups];
    cloned.categories = [...this.categories];
    cloned.visibleGroups = new Set(this.visibleGroups);
    cloned.scales = this.scales;
    cloned.scaleType = this.scaleType;
    cloned.isRendered = this.isRendered;
    return cloned;
  }

  getSnapshot(): {
    dataCount: number;
    groups: string[];
    categories: string[];
    visibleGroups: string[];
    scaleType: string;
    isRendered: boolean;
    } {
    return {
      dataCount: this.data.length,
      groups: [...this.groups],
      categories: [...this.categories],
      visibleGroups: Array.from(this.visibleGroups),
      scaleType: this.scaleType,
      isRendered: this.isRendered
    };
  }
}