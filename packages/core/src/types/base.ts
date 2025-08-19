//d3.chart에서 기본이 되는 타입 정의
import * as d3 from 'd3';

// 가장 기본이 되는 추상적인 데이터 포인트
export interface BaseDataPoint {
  // 필수 식별자 (옵셔널이지만 권장)
  id?: string | number;
  
  // 완전한 유연성을 위한 인덱스 시그니처
  [key: string]: any;
}

export interface DataPoint extends BaseDataPoint {
  // === 시간/날짜 축 데이터 ===
  date?: Date | string | number;
  time?: Date | string | number;
  timestamp?: Date | string | number;
  x?: Date | string | number;  // 일반적인 X축 값
  
  // === 값 축 데이터 ===
  value?: number;
  y?: number;                   // 기본 Y축 값
  y1?: number;                  // 두 번째 Y축 값 (dual axis)
  y2?: number;                  // 세 번째 Y축 값
  
  // === 다중 값 지원 ===
  values?: Record<string, number>;  // 여러 메트릭을 한 번에
  
  // === 그룹핑/시리즈 ===
  category?: string;
  group?: string;
  series?: string;
  type?: string;                // 차트 타입별 분류
  
  // === 표시/라벨링 ===
  label?: string;
  name?: string;
  title?: string;
  
  // === 스타일링 ===
  color?: string;
  size?: number;
  opacity?: number;
  
  // === 메타데이터 ===
  metadata?: Record<string, any>;
  
  // === 상태 ===
  visible?: boolean;
  selected?: boolean;
  highlighted?: boolean;
}



// 간단한 키-값 차트 데이터 (바 차트, 파이 차트 등)
export interface ChartData extends BaseDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ProcessedDataPoint extends DataPoint {
  // 처리된 후 표준화된 필드들
  parsedDate: Date;
  x: number | Date;
  y: number;
  group: string;
  
  // 원본 데이터 보존
  originalData?: DataPoint;
}

// 데이터 접근자 함수들의 타입 정의
export type DataAccessor<T = any> = (d: DataPoint) => T;
export type XAccessor = DataAccessor<Date | string | number>;
export type YAccessor = DataAccessor<number>;
export type GroupAccessor = DataAccessor<string>;

// 데이터 처리 옵션
export interface DataProcessingOptions {
  // 기본 접근자들
  xAccessor?: XAccessor;
  yAccessor?: YAccessor;
  groupAccessor?: GroupAccessor;
  
  // 날짜 파싱 옵션
  dateFormat?: string;
  parseDate?: (value: any) => Date;
  
  // 데이터 필터링
  filter?: (d: DataPoint) => boolean;
  
  // 데이터 정렬
  sort?: boolean;
  sortBy?: 'x' | 'y' | 'date' | ((a: ProcessedDataPoint, b: ProcessedDataPoint) => number);
}

export interface ChartConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  theme?: any;
  animation?: {
    duration: number;
    easing: string;
  };

  enableAnimation?: boolean;
  animationDuration?: number;
  
  // 데이터 처리 옵션 추가
  dataOptions?: DataProcessingOptions;
}

export interface Scales {
  xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  colorScale: d3.ScaleOrdinal<string, string>;
}

export interface ChartDimensions {
  width: number;
  height: number;
}