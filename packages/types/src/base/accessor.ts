import { DataPoint } from './data';

// 데이터 접근자 함수들의 타입 정의
export type DataAccessor<T = any> = (d: DataPoint) => T;
export type XAccessor = DataAccessor<Date | string | number>;
export type YAccessor = DataAccessor<number>;
export type GroupAccessor = DataAccessor<string>;
export type ColorAccessor = DataAccessor<string>;
export type SizeAccessor = DataAccessor<number>;
export type LabelAccessor = DataAccessor<string>;


export interface DataAccessors {
  x: XAccessor;
  y: YAccessor;
  group?: GroupAccessor;
  color?: ColorAccessor;
  size?: SizeAccessor;
  label?: LabelAccessor;
}