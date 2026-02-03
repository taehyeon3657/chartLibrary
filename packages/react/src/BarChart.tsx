import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { ChartFactory } from '@beaubrain/chart-lib-charts';
import type { BarChartConfig, ChartDataPoint } from '@beaubrain/chart-lib-types';

export interface BarChartProps {
  data: ChartDataPoint[];
  config?: Partial<BarChartConfig>;
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

export interface BarChartRef {
  chart: any;
  update: () => void;
  toggleGroup: (group: string) => void;
  updateConfig: (config: Partial<BarChartConfig>) => void;
  destroy: () => void;
  getState: () => any;
  exportChart: (format: 'png' | 'svg' | 'pdf', filename?: string) => void;
}

export const BarChart = forwardRef<any, BarChartProps>(
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
    const chartCreatedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      chart: chartRef.current,
      update: () => chartRef.current?.update(),
      toggleGroup: (group: string) => chartRef.current?.toggleGroup(group),
      updateConfig: (newConfig: Partial<BarChartConfig>) => {
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
      if (!containerRef.current || chartCreatedRef.current) return;

      let finalConfig = { ...config };

      if (preset) {
        finalConfig = ChartFactory.applyPreset(finalConfig as any, preset);
      }

      try {
        if (theme) {
          chartRef.current = ChartFactory.createWithTheme(
            'bar',
            containerRef.current,
            data,
            theme,
            finalConfig as any
          );
        } else if (responsive) {
          chartRef.current = ChartFactory.createResponsive(
            'bar',
            containerRef.current,
            data,
            finalConfig as any,
            responsive
          );
        } else {
          chartRef.current = ChartFactory.createBarChart(
            containerRef.current,
            data,
            finalConfig
          );
        }

        chartCreatedRef.current = true;

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
    }, []);

    // 데이터 업데이트
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

      if (onChartClick) chart.on('chartClick', onChartClick);
      if (onChartHover) chart.on('chartHover', onChartHover);
      if (onChartMouseenter) chart.on('chartMouseenter', onChartMouseenter);
      if (onChartMouseleave) chart.on('chartMouseleave', onChartMouseleave);
      if (onLegendToggle) chart.on('legendToggle', onLegendToggle);

      return () => {
        if (chart.removeAllListeners) {
          chart.removeAllListeners();
        }
      };
    }, [onChartClick, onChartHover, onChartMouseenter, onChartMouseleave, onLegendToggle]);

    // 언마운트
    useEffect(() => {
      return () => {
        requestAnimationFrame(() => {
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

BarChart.displayName = 'BarChart';