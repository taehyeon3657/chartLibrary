import type {
  ChartType,
  ChartDataPoint,
  BaseChartConfig,
  LineChartConfig,
  BarChartConfig
} from '@beaubrain/chart-lib-types';
import { LineChart } from './line';
import { BarChart } from './bar';

/**
 * 차트 생성을 위한 팩토리 클래스
 *
 * 주요 기능:
 * - 타입 기반 차트 생성
 * - 공통 설정 관리
 * - 편의 메서드 제공
 */

export class ChartFactory {
  /**
   * 차트 타입에 따른 인스턴스 생성
   */
  static create(
    type: ChartType,
    container: HTMLElement,
    config: BaseChartConfig
  ) {
    switch (type) {
    case 'line':
      return new LineChart(container, config as LineChartConfig);

    case 'bar':
      return new BarChart(container, config as BarChartConfig);

      // case 'pie':
      //   return new PieChart(container, config as PieChartConfig);

      // case 'area':
      //   return new AreaChart(container, config as AreaChartConfig);

    default:
      throw new Error(`Unsupported chart type: ${type}`);
    }
  }

  /**
   * 라인 차트 빠른 생성 (데이터 포함)
   */
  static createLineChart(
    container: HTMLElement,
    data: ChartDataPoint[],
    config: Partial<LineChartConfig> = {}
  ): LineChart {
    return new LineChart(container, config)
      .setData(data)
      .render();
  }

  /**
   * 바 차트 빠른 생성 (데이터 포함)
   */
  static createBarChart(
    container: HTMLElement,
    data: ChartDataPoint[],
    config: Partial<BarChartConfig> = {}
  ): BarChart {
    return new BarChart(container, config)
      .setData(data)
      .render();
  }

  /**
   * 반응형 차트 생성
   */
  static createResponsive(
    type: ChartType,
    container: HTMLElement,
    data: ChartDataPoint[],
    config: BaseChartConfig,
  ) {
    // 컨테이너 크기 측정
    const rect = container.getBoundingClientRect();
    const responsiveConfig = {
      ...config,
      width: config.width || Math.max(300, rect.width),
      height: config.height || Math.max(200, rect.height * 0.6),
      responsive: true
    };

    const chart = this.create(type, container, responsiveConfig);

    // 윈도우 리사이즈 이벤트 리스너
    if (responsiveConfig.responsive) {
      const handleResize = () => {
        const newRect = container.getBoundingClientRect();
        chart.updateConfig({
          width: Math.max(300, newRect.width),
          height: Math.max(200, newRect.height * 0.6)
        }).update();
      };

      window.addEventListener('resize', handleResize);

      // 정리 시 이벤트 리스너 제거
      const originalDestroy = chart.destroy.bind(chart);
      chart.destroy = () => {
        window.removeEventListener('resize', handleResize);
        originalDestroy();
      };
    }

    return chart.setData(data).render();
  }

  /**
   * 테마 기반 차트 생성
   */
  static createWithTheme(
    type: ChartType,
    container: HTMLElement,
    data: ChartDataPoint[],
    theme: 'light' | 'dark' | 'colorful' = 'light',
    config: BaseChartConfig,
  ) {
    const themeConfigs = {
      light: {
        lineColors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
        barColors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
        gridColor: '#f0f0f0',
        axisColor: '#111',
      },
      dark: {
        lineColors: ['#60a5fa', '#f87171', '#34d399', '#fbbf24'],
        barColors: ['#60a5fa', '#f87171', '#34d399', '#fbbf24'],
        gridColor: '#374151',
        axisColor: '#6b7280',
      },
      colorful: {
        lineColors: ['#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#84cc16'],
        barColors: ['#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#84cc16'],
        gridColor: '#e5e7eb',
        axisColor: '#9ca3af',
      }
    };

    const themedConfig = {
      ...config,
      ...themeConfigs[theme]
    };

    return this.create(type, container, themedConfig)
      .setData(data)
      .render();
  }

  /**
   * 실시간 데이터 차트 생성
   */
  static createRealtime(
    type: ChartType,
    container: HTMLElement,
    initialData: ChartDataPoint[],
    config: BaseChartConfig & { updateInterval?: number },
  ) {
    const chart = this.create(type, container, config)
      .setData(initialData)
      .render();

    const updateInterval = config.updateInterval || 1000;
    const data = [...initialData];

    // 실시간 업데이트 인터벌 설정
    const intervalId = setInterval(() => {
      // 예시: 마지막 데이터 포인트에서 약간의 변화를 주어 새 데이터 생성
      const lastPoint = data[data.length - 1];
      const newPoint: ChartDataPoint = {
        ...lastPoint,
        date: new Date(Date.now()),
        value: (lastPoint.value || 0) + (Math.random() - 0.5) * 10,
        timestamp: Date.now()
      };

      // 최대 100개 데이터 포인트 유지 (sliding window)
      data.push(newPoint);
      if (data.length > 100) {
        data.shift();
      }

      chart.setData(data).update();
    }, updateInterval);

    // 정리 시 인터벌 제거
    const originalDestroy = chart.destroy.bind(chart);
    chart.destroy = () => {
      clearInterval(intervalId);
      originalDestroy();
    };

    return chart;
  }

  /**
   * 다중 차트 생성 (대시보드용)
   */
  static createDashboard(
    container: HTMLElement,
    charts: Array<{
      type: ChartType;
      data: ChartDataPoint[];
      config?: BaseChartConfig;
      title?: string;
    }>,
    layout: 'grid' | 'horizontal' | 'vertical' = 'grid'
  ) {
    const chartInstances: unknown[] = [];

    charts.forEach((chartConfig, index) => {
      const chartContainer = document.createElement('div');
      chartContainer.className = `chart-item chart-item-${index}`;

      // 레이아웃 스타일 적용
      switch (layout) {
      case 'grid': {
        const cols = Math.ceil(Math.sqrt(charts.length));
        chartContainer.style.cssText = `
            display: inline-block;
            width: ${100 / cols}%;
            height: 300px;
            padding: 10px;
            box-sizing: border-box;
          `;
        break;
      }
      case 'horizontal':
        chartContainer.style.cssText = `
            display: inline-block;
            width: ${100 / charts.length}%;
            height: 400px;
            padding: 10px;
            box-sizing: border-box;
          `;
        break;
      case 'vertical':
        chartContainer.style.cssText = `
            width: 100%;
            height: 300px;
            margin-bottom: 20px;
            padding: 10px;
            box-sizing: border-box;
          `;
        break;
      }

      // 제목 추가
      if (chartConfig.title) {
        const titleElement = document.createElement('h3');
        titleElement.textContent = chartConfig.title;
        titleElement.style.cssText = 'margin: 0 0 10px 0; font-size: 16px; font-weight: bold;';
        chartContainer.appendChild(titleElement);
      }

      // 차트용 div 생성
      const chartDiv = document.createElement('div');
      chartDiv.style.cssText = 'width: 100%; height: calc(100% - 30px);';
      chartContainer.appendChild(chartDiv);

      container.appendChild(chartContainer);

      // 차트 생성
      const chart = this.create(chartConfig.type, chartDiv, {
        width: chartDiv.offsetWidth,
        height: chartDiv.offsetHeight,
        margin: { top: 20, right: 20, bottom: 30, left: 40 },
        ...chartConfig.config
      }).setData(chartConfig.data).render();

      chartInstances.push(chart);
    });

    return {
      charts: chartInstances,
      destroy: () => chartInstances.forEach(chart => (chart as { destroy: () => void }).destroy())
    };
  }

  /**
   * SVG 다운로드
   */
  private static downloadSVG(svg: SVGElement, filename: string): void {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * PNG 다운로드
   */
  private static downloadPNG(svg: SVGElement, filename: string): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const svgRect = svg.getBoundingClientRect();
    canvas.width = svgRect.width * 2; // 고해상도
    canvas.height = svgRect.height * 2;

    const img = new Image();
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.scale(2, 2); // 고해상도
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(downloadUrl);
        }
      }, 'image/png');

      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  /**
   * 차트 내보내기 기능
   */
  static exportChart(
    chart: unknown & { container?: HTMLElement },
    format: 'png' | 'svg' | 'pdf' = 'png',
    filename?: string
  ): void {
    const svg = chart.container?.querySelector('svg');
    if (!svg) {
      console.error('Chart SVG not found');
      return;
    }

    const name = filename || `chart-${Date.now()}`;

    switch (format) {
    case 'svg':
      this.downloadSVG(svg, `${name}.svg`);
      break;
    case 'png':
      this.downloadPNG(svg, `${name}.png`);
      break;
    case 'pdf':
      console.warn('PDF export not implemented yet');
      break;
    }
  }

  /**
   * 차트 비교 뷰 생성
   */
  static createComparison(
    container: HTMLElement,
    datasets: Array<{
      name: string;
      data: ChartDataPoint[];
      config?: Partial<LineChartConfig | BarChartConfig>;
    }>,
    comparisonType: 'overlay' | 'sideBySide' = 'overlay',
    chartType: 'line' | 'bar' = 'line'
  ) {
    if (comparisonType === 'overlay') {
      // 모든 데이터를 하나의 차트에 오버레이
      const combinedData: ChartDataPoint[] = [];

      datasets.forEach(dataset => {
        const dataWithGroup = dataset.data.map(point => ({
          ...point,
          group: dataset.name
        }));
        combinedData.push(...dataWithGroup);
      });

      if (chartType === 'line') {
        return this.createLineChart(container, combinedData, {
          showLegend: true,
          legendPosition: 'top',
          title: 'Data Comparison'
        });
      } else {
        return this.createBarChart(container, combinedData, {
          showLegend: true,
          legendPosition: 'top',
          title: 'Data Comparison',
          grouped: true
        });
      }
    } else {
      // 나란히 배치
      return this.createDashboard(
        container,
        datasets.map(dataset => ({
          type: chartType as ChartType,
          data: dataset.data,
          config: dataset.config as BaseChartConfig,
          title: dataset.name
        })),
        'horizontal'
      );
    }
  }

  /**
   * 설정 프리셋 적용
   */
  static applyPreset(
    config: BaseChartConfig,
    preset: 'minimal' | 'detailed' | 'presentation' | 'dashboard'
  ): BaseChartConfig {
    const presets = {
      minimal: {
        showXAxis: true,
        showYAxis: true,
        gridLines: false,
        showLegend: false,
        showDots: false,
        showValues: false,
        lineWidth: 1
      },
      detailed: {
        showXAxis: true,
        showYAxis: true,
        gridLines: true,
        showLegend: true,
        showDots: true,
        showValues: true,
        showAreaFill: true,
        enableAnimation: true,
        showTooltip: true
      },
      presentation: {
        showXAxis: true,
        showYAxis: true,
        gridLines: true,
        showLegend: true,
        showDots: true,
        showValues: true,
        lineWidth: 3,
        dotRadius: 6,
        enableAnimation: true,
        animationDuration: 800,
      },
      dashboard: {
        showXAxis: true,
        showYAxis: true,
        gridLines: true,
        showLegend: true,
        showDots: false,
        showValues: false,
        lineWidth: 2,
        margin: { top: 20, right: 20, bottom: 30, left: 40 }
      }
    };

    return { ...config, ...presets[preset] };
  }
}