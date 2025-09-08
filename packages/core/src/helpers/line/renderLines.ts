import * as d3 from 'd3';
import { LineChartConfig, ProcessedDataPoint } from '@charts-library/types';
import { Scales } from '../../types/base';
import { CHART_CONFIG } from '../../constants';
import { getCurveFunction } from './getLineFunction';
import { renderTrendExtension } from './renderTrendExtension';

export const renderLines = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  groupedData: Map<string, ProcessedDataPoint[]>,
  groups: string[],
  scales: Scales,
  config: Partial<LineChartConfig>,
  actualDates: Date[]
): void => {
  const {
    lineWidth = CHART_CONFIG.DEFAULT_PROPS.lineWidth,
    enableCurve = true,
    curveType = 'monotoneX',
    enableAnimation = false,
    animationDuration = CHART_CONFIG.DEFAULT_PROPS.animationDuration,
    showAreaFill = false,
    areaFillOpacity = 0.08,
    showTrendExtension = false,
    trendExtensionLength = 50,
    trendExtensionOpacity = 1,
    trendAnalysisPoints = 3
  } = config;

  const { xScale, yScale, colorScale } = scales;

  // 커브 타입 설정
  const curveFunction = enableCurve ? getCurveFunction(curveType) : d3.curveLinear;

  // 라인 생성기
  const line = d3
    .line<ProcessedDataPoint>()
    .x((d) => xScale(d.parsedDate) as number)
    .y((d) => yScale(d.y))
    .curve(curveFunction);

  // 영역 생성기 (area fill용)
  const area = d3
    .area<ProcessedDataPoint>()
    .x((d) => xScale(d.parsedDate) as number)
    .y0(yScale(0))
    .y1((d) => yScale(d.y))
    .curve(curveFunction);

  // defs 요소 생성 (그라디언트용)
  const defs = g.select('defs').empty() ? g.append('defs') : g.select('defs');

  groups.forEach((group) => {
    const groupData = groupedData.get(group) || [];
    if (groupData.length === 0) return;

    const color = colorScale(group);

    // Area fill 렌더링 (라인보다 먼저)
    if (showAreaFill) {
      renderAreaFill(
        g,
        defs,
        groupData,
        group,
        color,
        area,
        areaFillOpacity,
        enableAnimation,
        animationDuration,
        scales.xScale.range()[1] as number
      );
    }

    // 라인 렌더링
    const path = g
      .append('path')
      .datum(groupData)
      .attr('class', `line line-${group.replace(/\s+/g, '-')}`)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', lineWidth)
      .attr('d', line);

    // 라인 애니메이션
    if (enableAnimation) {
      const pathElement = path.node();
      if (pathElement) {
        const totalLength = pathElement.getTotalLength();
        path
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(animationDuration)
          .ease(d3.easeQuadOut)
          .attr('stroke-dashoffset', 0);
      }
    }

    // 트렌드 연장선 렌더링
    if (showTrendExtension && groupData.length >= trendAnalysisPoints) {
      renderTrendExtension(
        g,
        groupData,
        group,
        color,
        scales,
        trendExtensionLength,
        trendExtensionOpacity,
        trendAnalysisPoints,
        line,
        enableAnimation,
        animationDuration
      );
    }
  });
};

function renderAreaFill(g: d3.Selection<SVGGElement, unknown, null, undefined>, defs: any, groupData: ProcessedDataPoint[], group: string, color: any, area: any, areaFillOpacity: number, enableAnimation: any, animationDuration: any, arg9: number) {
    throw new Error('Function not implemented.');
}
