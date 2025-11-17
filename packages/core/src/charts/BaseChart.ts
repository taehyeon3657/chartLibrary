import * as d3 from 'd3';
import { EventEmitter } from '../utils/EventEmitter';
import type { AllChartEvents, BaseChartConfig, ChartDataPoint } from '@beaubrain/chart-lib-types';

export abstract class BaseChart extends EventEmitter<AllChartEvents> {
    protected container: HTMLElement;
    protected svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
    protected chartArea: d3.Selection<SVGGElement, unknown, null, undefined> | undefined;
    protected config: BaseChartConfig;
    protected data: ChartDataPoint[];

    private static tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null = null;


    constructor(container: HTMLElement, config: Partial<BaseChartConfig>) {
        super();
        this.container = container;
        this.config = {
            width: 400,
            height: 300,
            margin: { top: 20, right: 20, bottom: 40, left: 60 },
            theme: {
                colors: {
                    primary: [],
                    background: '',
                    text: '',
                    grid: '',
                    axis: ''
                },
                fonts: {
                    family: '',
                    size: {
                        small: 0,
                        medium: 0,
                        large: 0
                    }
                },
                spacing: {
                    small: 0,
                    medium: 0,
                    large: 0
                }
            },
            animation: { duration: 300, easing: 'ease-out' },
            ...config
        };
        this.data = [];
    }

    private initializeSvg(): void {
        //기존 svg 제거
        d3.select(this.container).select('svg').remove();
        //새 svg 생성
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.config.width)
            .attr('height', this.config.height);

        this.chartArea = this.svg.append('g')
            .attr('class', 'chart-area')
            .attr('transform', `translate(${this.config.margin.left}, ${this.config.margin.top})`);
    }

    protected get innerWidth(): number {
        return this.config.width - this.config.margin.left - this.config.margin.right;
    }

    protected get innerHeight(): number {
        return this.config.height - this.config.margin.top - this.config.margin.bottom;
    }

    public setData(data: ChartDataPoint[]): this {
        this.data = data;
        return this;
    }

    public updateConfig(config: Partial<BaseChartConfig>): this {
        this.config = { ...this.config, ...config };
        this.initializeSvg();
        return this;
    }

    public abstract render(): this;

    public abstract update(): this;

    public destroy(): void {
        d3.select(this.container).select('svg').remove();
        this.removeAllListeners();
    }

     protected setupTooltip(): d3.Selection<HTMLDivElement, unknown, HTMLElement, any> {
    if (!BaseChart.tooltip) {
      BaseChart.tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'chart-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none');
    }
    return BaseChart.tooltip;
  }
}