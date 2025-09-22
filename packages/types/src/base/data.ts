import { GroupAccessor, XAccessor, YAccessor } from "./accessor";

// 가장 기본이 되는 데이터 타입들
export interface BaseDataPoint {
  id?: string | number;
  [key: string]: any;
}

export interface DataPoint extends BaseDataPoint {
  // 시간/날짜 축 데이터
  date?: Date | string | number;
  time?: Date | string | number;
  timestamp?: Date | string | number;
  x?: Date | string | number;
  
  // 값 축 데이터
  value?: number;
  y?: number;
  y1?: number;
  y2?: number;
  
  // 다중 값 지원
  values?: Record<string, number>;
  
  // 그룹핑/시리즈
  category?: string;
  group?: string;
  series?: string;
  type?: string;
  
  // 표시/라벨링
  label?: string;
  name?: string;
  title?: string;
  
  // 스타일링
  color?: string;
  size?: number;
  opacity?: number;
  
  // 메타데이터
  metadata?: Record<string, any>;
  
  // 상태
  visible?: boolean;
  selected?: boolean;
  highlighted?: boolean;
}

export interface ChartData extends BaseDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ProcessedDataPoint extends DataPoint {
  // 처리된 후 표준화된 필드들
  parsedDate: Date;
  x: number | Date | string ;
  y: number;
  group: string;
  
  // 원본 데이터 보존
  originalData?: DataPoint;
}

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