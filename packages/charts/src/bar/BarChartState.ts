import type { ProcessedDataPoint } from '@beaubrain/chart-lib-types';
import type { ChartScales } from '../shared';

/**
 * BarChart의 모든 상태를 관리하는 클래스
 */
export class BarChartState {
  private data: ProcessedDataPoint[] = [];
  private groupedData = new Map<string, ProcessedDataPoint[]>();
  private categoryData = new Map<string, ProcessedDataPoint[]>();
  private groups: string[] = [];
  private categories: string[] = [];
  private visibleGroups = new Set<string>();
  private scales: ChartScales | null = null;
  private scaleType: 'time' | 'linear' | 'ordinal' = 'ordinal';
  private isRendered = false;

  // ... (setData, getData 등 기존 메서드 유지) ...

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

  // ... (updateGroupData, updateCategoryData 등 기존 메서드 유지) ...

  private updateGroupData(): void {
    this.groupedData.clear();
    this.data.forEach(item => {
      const group = item.group;
      if (!this.groupedData.has(group)) {
        this.groupedData.set(group, []);
      }
      this.groupedData.get(group)!.push(item);
    });

    this.groups = Array.from(this.groupedData.keys());

    if (this.visibleGroups.size === 0) {
      this.visibleGroups = new Set(this.groups);
    } else {
      this.groups.forEach(group => {
        if (!this.visibleGroups.has(group)) {
          this.visibleGroups.add(group);
        }
      });
    }
  }

  private updateCategoryData(): void {
    this.categoryData.clear();
    this.data.forEach(item => {
      const category = String(item.x);
      if (!this.categoryData.has(category)) {
        this.categoryData.set(category, []);
      }
      this.categoryData.get(category)!.push(item);
    });
    this.categories = Array.from(this.categoryData.keys()).sort();
  }

  // ... (toggleGroup, showGroup, hideGroup 등 기존 메서드 유지) ...

  toggleGroup(group: string): boolean {
    if (this.visibleGroups.has(group)) {
      this.visibleGroups.delete(group);
      return false;
    } else {
      this.visibleGroups.add(group);
      return true;
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

  // ... (setScales, getScales 등 기존 메서드 유지) ...

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

  setRendered(rendered: boolean): void {
    this.isRendered = rendered;
  }

  isChartRendered(): boolean {
    return this.isRendered;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  getDataCount(): number {
    return this.data.length;
  }

  getVisibleDataCount(): number {
    return this.getVisibleData().length;
  }

  // ============================================
  // [수정됨] 데이터 범위 계산 (중복 데이터 처리 방식 개선)
  // ============================================
  getDataExtent(isStacked: boolean = false): {
    xDomain: string[];
    yDomain: [number, number];
  } {
    if (this.data.length === 0) {
      return { xDomain: [], yDomain: [0, 100] };
    }

    const visibleData = this.getVisibleData();
    const xDomain = [...new Set(visibleData.map(d => String(d.x)))].sort();

    let yDomain: [number, number];

    if (isStacked) {
      // [중요 수정]
      // 기존에는 visibleData 전체를 순회하며 더했기 때문에 중복 데이터가 있으면 값이 뻥튀기되었습니다.
      // 렌더링 로직(getStackedData)과 동일하게 "카테고리별로 그룹당 1개"만 찾아서 더해야 합니다.

      const sumsByCategory = new Map<string, { pos: number, neg: number }>();

      // 1. 모든 카테고리를 순회
      this.categories.forEach(category => {
        // 해당 카테고리의 데이터들
        const items = this.categoryData.get(category) || [];

        if (!sumsByCategory.has(category)) {
          sumsByCategory.set(category, { pos: 0, neg: 0 });
        }
        const sum = sumsByCategory.get(category)!;

        // 2. 현재 보이는 그룹들을 순회
        this.groups.forEach(group => {
          if (!this.visibleGroups.has(group)) return;

          // 3. [핵심] 렌더링 시와 동일하게 find()로 첫 번째 매칭 데이터만 가져옴
          const item = items.find(d => d.group === group);

          if (item) {
            const value = Number(item.y);
            if (!isNaN(value)) {
              if (value >= 0) sum.pos += value;
              else sum.neg += value;
            }
          }
        });
      });

      const maxVal = Math.max(0, ...Array.from(sumsByCategory.values()).map(s => s.pos));
      const minVal = Math.min(0, ...Array.from(sumsByCategory.values()).map(s => s.neg));

      yDomain = [minVal, maxVal];

    } else {
      // General (Single/Grouped) 모드도 중복 데이터 이슈가 있을 수 있으므로
      // 안전하게 숫자 변환 후 계산
      const yValues = visibleData.map(d => Number(d.y)).filter(n => !isNaN(n));
      if (yValues.length > 0) {
        yDomain = [
          Math.min(0, ...yValues),
          Math.max(...yValues)
        ];
      } else {
        yDomain = [0, 100];
      }
    }

    return { xDomain, yDomain };
  }

  // ... (getStackedData, getGroupOffsets 등 나머지 메서드는 기존 유지) ...

  getStackedData(): Map<string, Array<{ category: string; y0: number; y1: number; value: number; group: string }>> {
    const stackedData = new Map<string, Array<{ category: string; y0: number; y1: number; value: number; group: string }>>();

    this.categories.forEach(category => {
      const categoryItems = this.categoryData.get(category) || [];
      let positiveCumulative = 0;
      let negativeCumulative = 0;

      this.groups.forEach(group => {
        if (!this.visibleGroups.has(group)) return;

        const item = categoryItems.find(d => d.group === group);
        const value = item?.y || 0;

        if (!stackedData.has(group)) {
          stackedData.set(group, []);
        }

        let y0: number, y1: number;

        if (value >= 0) {
          y0 = positiveCumulative;
          y1 = positiveCumulative + value;
          positiveCumulative += value;
        } else {
          y0 = negativeCumulative;
          y1 = negativeCumulative + value;
          negativeCumulative += value;
        }

        stackedData.get(group)!.push({
          category,
          y0,
          y1,
          value,
          group
        });
      });
    });

    return stackedData;
  }

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