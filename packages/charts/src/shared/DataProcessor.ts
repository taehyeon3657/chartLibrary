import type { 
  ChartDataPoint, 
  ProcessedDataPoint, 
  DataProcessingOptions 
} from '@charts-library/types';

/**
 * 차트 데이터 처리를 담당하는 헤드리스 유틸리티 클래스
 * 
 * 주요 기능:
 * - 원본 데이터를 차트에서 사용할 수 있는 형태로 변환
 * - 날짜 파싱, 그룹핑, 정렬 등 공통 처리 로직
 * - 다양한 데이터 형태 지원 (시계열, 카테고리형 등)
 */
export class DataProcessor {
  /**
   * 원본 데이터를 처리된 데이터로 변환
   */
  static process(
    data: ChartDataPoint[], 
    options: DataProcessingOptions = {}
  ): ProcessedDataPoint[] {
    const {
      xAccessor = (d: ChartDataPoint) => (d.date ?? d.x ?? d.timestamp ?? 0),
      yAccessor = (d: ChartDataPoint) => d.value ?? d.y ?? 0, 
      groupAccessor = (d: ChartDataPoint) => d.group || d.series || d.category || 'default',
      parseDate = DataProcessor.defaultDateParser,
      filter,
      sort = true,
      sortBy = 'x'
    } = options;

    // 1. 기본 변환
    let processed = data.map((d, index): ProcessedDataPoint => {
      const xValue = xAccessor(d);
      const yValue = yAccessor(d);
      const groupValue = groupAccessor(d);

      return {
        ...d,
        parsedDate: DataProcessor.parseToDate(xValue, parseDate),
        x: xValue,
        y: typeof yValue === 'number' ? yValue : 0,
        group: String(groupValue),
        originalData: d
      };
    });

    // 2. 필터링
    if (filter) {
      processed = processed.filter(filter);
    }

    // 3. 정렬
    if (sort) {
      processed = DataProcessor.sortData(processed, sortBy);
    }

    return processed;
  }

  /**
   * 처리된 데이터를 그룹별로 분류
   */
  static groupByCategory(data: ProcessedDataPoint[]): Map<string, ProcessedDataPoint[]> {
    const groups = new Map<string, ProcessedDataPoint[]>();

    data.forEach(item => {
      const group = item.group;
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(item);
    });

    // 각 그룹 내에서 x값 기준 정렬
    groups.forEach(groupData => {
      groupData.sort((a, b) => {
        if (a.parsedDate && b.parsedDate) {
          return a.parsedDate.getTime() - b.parsedDate.getTime();
        }
        return 0;
      });
    });

    return groups;
  }

  /**
   * 데이터 통계 정보 계산
   */
  static getDataStats(data: ProcessedDataPoint[]) {
    if (data.length === 0) {
      return {
        xDomain: [new Date(), new Date()],
        yDomain: [0, 0],
        groups: [],
        dataCount: 0
      };
    }

    const xValues = data.map(d => d.parsedDate).filter(Boolean) as Date[];
    const yValues = data.map(d => d.y);
    const groups = [...new Set(data.map(d => d.group))];

    return {
      xDomain: [
        new Date(Math.min(...xValues.map(d => d.getTime()))),
        new Date(Math.max(...xValues.map(d => d.getTime())))
      ],
      yDomain: [
        Math.min(...yValues),
        Math.max(...yValues)
      ],
      groups,
      dataCount: data.length
    };
  }

  /**
   * 기본 날짜 파서
   */
  private static defaultDateParser = (value: any): Date => {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    if (typeof value === 'number') return new Date(value);
    return new Date();
  };

  /**
   * 다양한 값을 Date로 변환
   */
  private static parseToDate(value: any, parser: (value: any) => Date): Date {
    try {
      return parser(value);
    } catch {
      return new Date();
    }
  }

  /**
   * 데이터 정렬
   */
  private static sortData(
    data: ProcessedDataPoint[], 
    sortBy: 'x' | 'y' | 'date' | ((a: ProcessedDataPoint, b: ProcessedDataPoint) => number)
  ): ProcessedDataPoint[] {
    if (typeof sortBy === 'function') {
      return [...data].sort(sortBy);
    }

    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'x':
        case 'date':
          return a.parsedDate.getTime() - b.parsedDate.getTime();
        case 'y':
          return a.y - b.y;
        default:
          return 0;
      }
    });
  }

  /**
   * 데이터 유효성 검증
   */
  static validateData(data: ChartDataPoint[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('Data must be an array');
      return { isValid: false, errors, warnings };
    }

    if (data.length === 0) {
      warnings.push('Data array is empty');
    }

    data.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) {
        errors.push(`Item at index ${index} must be an object`);
        return;
      }

      // x/날짜 값 검증
      const xValue = item.date || item.x || item.timestamp;
      if (xValue === undefined) {
        warnings.push(`Item at index ${index} missing x/date value`);
      }

      // y/값 검증
      const yValue = item.value || item.y;
      if (yValue === undefined) {
        warnings.push(`Item at index ${index} missing y/value`);
      } else if (typeof yValue !== 'number' || isNaN(yValue)) {
        errors.push(`Item at index ${index} has invalid y/value: ${yValue}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}