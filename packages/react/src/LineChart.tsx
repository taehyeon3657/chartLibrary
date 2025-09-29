import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { ChartFactory } from '@charts-library/charts';
import type { LineChartConfig, ChartDataPoint } from '@charts-library/types';

export interface LineChartProps {
  data: ChartDataPoint[];
  config?: Partial<LineChartConfig>;
  // 편의 기능 props
  theme?: 'light' | 'dark' | 'colorful';
  responsive?: boolean;
  preset?: 'minimal' | 'detailed' | 'presentation' | 'dashboard';
  // 이벤트 핸들러
  onChartClick?: (event: any) => void;
  onChartHover?: (event: any) => void;
  onChartMouseenter?: (event: any) => void;
  onChartMouseleave?: (event: any) => void;
  onLegendToggle?: (event: any) => void;
  onRendered?: (event: any) => void;
  onUpdated?: (event: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface LineChartRef {
  chart: any;
  update: () => void;
  toggleGroup: (group: string) => void;
  updateConfig: (config: Partial<LineChartConfig>) => void;
  destroy: () => void;
  getState: () => any;
  exportChart: (format: 'png' | 'svg' | 'pdf', filename?: string) => void;
}

/**
 * React wrapper for LineChart using ChartFactory
 * 
 * 사용 예시:
 * ```tsx
 * // 기본 사용
 * <LineChart 
 *   data={data}
 *   config={{ width: 800, height: 400 }}
 * />
 * 
 * // 테마 적용
 * <LineChart 
 *   data={data}
 *   theme="dark"
 *   preset="presentation"
 * />
 * 
 * // 반응형
 * <LineChart 
 *   data={data}
 *   responsive={true}
 * />
 * ```
 */
export const LineChart = forwardRef<LineChartRef, LineChartProps>(
  (
    { 
      data, 
      config = {},
      theme,
      responsive = false,
      preset,
      onChartClick, 
      onChartHover,
      onChartMouseenter,
      onChartMouseleave,
      onLegendToggle,
      onRendered,
      onUpdated,
      className, 
      style 
    }, 
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const isInitialMount = useRef(true);

    // 명령형 API 제공 (ref를 통한 접근)
    useImperativeHandle(ref, () => ({
      chart: chartRef.current,
      update: () => {
        chartRef.current?.update();
      },
      toggleGroup: (group: string) => {
        chartRef.current?.toggleGroup(group);
      },
      updateConfig: (newConfig: Partial<LineChartConfig>) => {
        chartRef.current?.updateConfig(newConfig);
      },
      destroy: () => {
        chartRef.current?.destroy();
      },
      getState: () => {
        return chartRef.current?.getState();
      },
      exportChart: (format: 'png' | 'svg' | 'pdf', filename?: string) => {
        if (chartRef.current) {
          ChartFactory.exportChart(chartRef.current, format, filename);
        }
      }
    }));

    // 차트 초기화 및 데이터 업데이트
    useEffect(() => {
      if (!containerRef.current) return;

      // 최초 마운트 시: 차트 생성
      if (isInitialMount.current) {
        let finalConfig = { ...config };

        // preset 적용
        if (preset) {
          finalConfig = ChartFactory.applyPreset(finalConfig as any, preset);
        }

        // 차트 생성 방식 선택
        if (theme) {
          // 테마 기반 생성
          chartRef.current = ChartFactory.createWithTheme(
            'line',
            containerRef.current,
            data,
            theme,
            finalConfig as any
          );
        } else if (responsive) {
          // 반응형 생성
          chartRef.current = ChartFactory.createResponsive(
            'line',
            containerRef.current,
            data,
            finalConfig as any
          );
        } else {
          // 일반 생성 (빠른 생성 메서드 사용)
          chartRef.current = ChartFactory.createLineChart(
            containerRef.current,
            data,
            finalConfig
          );
        }

        isInitialMount.current = false;
      } else {
        // 데이터 변경 시: 업데이트
        if (chartRef.current) {
          chartRef.current.setData(data).update();
        }
      }
    }, [data, theme, responsive, preset]);

    // 설정 변경 시 업데이트
    useEffect(() => {
      if (!isInitialMount.current && chartRef.current && config) {
        let finalConfig = { ...config };
        if (preset) {
          finalConfig = ChartFactory.applyPreset(finalConfig as any, preset);
        }
        chartRef.current.updateConfig(finalConfig).update();
      }
    }, [config, preset]);

    // 이벤트 리스너 등록
    useEffect(() => {
      if (!chartRef.current) return;

      const chart = chartRef.current;

      // 이벤트 핸들러 등록
      if (onChartClick) {
        chart.on('chartClick', onChartClick);
      }
      if (onChartHover) {
        chart.on('chartHover', onChartHover);
      }
      if (onChartMouseenter) {
        chart.on('chartMouseenter', onChartMouseenter);
      }
      if (onChartMouseleave) {
        chart.on('chartMouseleave', onChartMouseleave);
      }
      if (onLegendToggle) {
        chart.on('legendToggle', onLegendToggle);
      }
      if (onRendered) {
        chart.on('rendered', onRendered);
      }
      if (onUpdated) {
        chart.on('updated', onUpdated);
      }

      // Cleanup: 이벤트 리스너 제거
      return () => {
        chart.removeAllListeners();
      };
    }, [onChartClick, onChartHover, onChartMouseenter, onChartMouseleave, onLegendToggle, onRendered, onUpdated]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    }, []);

    return (
      <div 
        ref={containerRef} 
        className={className}
        style={style}
      />
    );
  }
);

LineChart.displayName = 'LineChart';