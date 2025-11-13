import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { ChartFactory } from '@beaubrain/charts';
import type { LineChartConfig, ChartDataPoint } from '@beaubrain/types';

export interface LineChartProps {
  data: ChartDataPoint[];
  config?: Partial<LineChartConfig>;
  theme?: 'light' | 'dark' | 'colorful';
  responsive?: boolean;
  preset?: 'minimal' | 'detailed' | 'presentation' | 'dashboard';
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

export const LineChart = forwardRef<any, LineChartProps>(
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
    const chartCreatedRef = useRef(false); // 차트 생성 여부만 추적

    // 명령형 API 제공
    useImperativeHandle(ref, () => ({
      chart: chartRef.current,
      update: () => chartRef.current?.update(),
      toggleGroup: (group: string) => chartRef.current?.toggleGroup(group),
      updateConfig: (newConfig: Partial<LineChartConfig>) => {
        chartRef.current?.updateConfig(newConfig);
      },
      destroy: () => chartRef.current?.destroy(),
      getState: () => chartRef.current?.getState(),
      exportChart: (format: 'png' | 'svg' | 'pdf', filename?: string) => {
        if (chartRef.current) {
          ChartFactory.exportChart(chartRef.current, format, filename);
        }
      }
    }));

    // 차트 생성
    useEffect(() => {
      // console.log('Chart creation effect', {
      //   hasContainer: !!containerRef.current,
      //   chartCreated: chartCreatedRef.current,
      //   hasChart: !!chartRef.current
      // });

      if (!containerRef.current) return;

      // 이미 차트가 생성되었으면 스킵
      if (chartCreatedRef.current && chartRef.current) {

        return;
      }



      let finalConfig = { ...config };

      if (preset) {
        finalConfig = ChartFactory.applyPreset(finalConfig as any, preset);
      }

      // 차트 생성
      try {
        if (theme) {
          chartRef.current = ChartFactory.createWithTheme(
            'line',
            containerRef.current,
            data,
            theme,
            finalConfig as any
          );
        } else if (responsive) {
          chartRef.current = ChartFactory.createResponsive(
            'line',
            containerRef.current,
            data,
            finalConfig as any
          );
        } else {
          chartRef.current = ChartFactory.createLineChart(
            containerRef.current,
            data,
            finalConfig
          );
        }

        chartCreatedRef.current = true;
        // console.log('Chart created successfully:', chartRef.current);

        // onRendered 콜백 실행
        if (onRendered) {
          setTimeout(() => {
            if (containerRef.current?.querySelector('svg') && chartRef.current) {
              onRendered({ chart: chartRef.current });
            }
          }, 50);
        }
      } catch (error) {
        console.error('Chart creation failed:', error);
      }

    }, []); // 빈 배열 - 마운트 시 한 번만

    // 데이터 업데이트만 별도로 처리
    useEffect(() => {
      if (chartCreatedRef.current && chartRef.current) {
        chartRef.current.setData(data).update();

        if (onUpdated) {
          setTimeout(() => {
            if (chartRef.current) {
              onUpdated({ chart: chartRef.current });
            }
          }, 0);
        }
      }
    }, [data, onUpdated]);

    // 설정 변경 시 업데이트
    useEffect(() => {
      if (chartCreatedRef.current && chartRef.current && config) {
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

      return () => {
        // 이벤트만 제거, 차트는 destroy 안 함
        if (chart.removeAllListeners) {
          chart.removeAllListeners();
        }
      };
    }, [onChartClick, onChartHover, onChartMouseenter, onChartMouseleave, onLegendToggle]);

    // 언마운트에서만 destroy (마지막 방어선)
    useEffect(() => {
      return () => {

        // 실제 언마운트인지 확인
        requestAnimationFrame(() => {
          // DOM에서 컨테이너가 제거되었는지 확인
          if (containerRef.current && !document.body.contains(containerRef.current)) {

            if (chartRef.current) {
              chartRef.current.destroy();
              chartRef.current = null;
              chartCreatedRef.current = false;
            }
          }
        });
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