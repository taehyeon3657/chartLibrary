import * as d3 from 'd3';
import { ProcessedDataPoint } from '@beaubrain/types';
import { Scales } from '../../types/base';

export const renderTrendExtension = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  groupData: ProcessedDataPoint[],
  group: string,
  color: string,
  scales: Scales,
  extensionLength: number,
  opacity: number,
  analysisPoints: number,
  line: d3.Line<ProcessedDataPoint>,
  enableAnimation: boolean,
  animationDuration: number
): void => {
  const { xScale, yScale } = scales;

  // 마지막 N개 포인트로 트렌드 계산
  const recentPoints = groupData.slice(-analysisPoints);
  if (recentPoints.length < 2) return;

  // 선형 회귀로 트렌드 계산
  const xValues = recentPoints.map(d => d.parsedDate.getTime());
  const yValues = recentPoints.map(d => d.y);

  const n = recentPoints.length;
  const sumX = d3.sum(xValues);
  const sumY = d3.sum(yValues);
  const sumXY = d3.sum(xValues.map((x, i) => x * yValues[i]));
  const sumXX = d3.sum(xValues.map(x => x * x));

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 연장선 끝점 계산
  const lastPoint = groupData[groupData.length - 1];
  const extensionEndTime = lastPoint.parsedDate.getTime() + extensionLength * 24 * 60 * 60 * 1000;
  const extensionEndValue = slope * extensionEndTime + intercept;

  const extensionData: ProcessedDataPoint[] = [
    lastPoint,
    {
      ...lastPoint,
      parsedDate: new Date(extensionEndTime),
      y: extensionEndValue
    }
  ];

  // 연장선 렌더링
  const extensionPath = g
    .append('path')
    .datum(extensionData)
    .attr('class', `trend-extension trend-extension-${group.replace(/\s+/g, '-')}`)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5')
    .attr('stroke-opacity', opacity)
    .attr('d', line);

  if (enableAnimation) {
    const pathElement = extensionPath.node();
    if (pathElement) {
      const totalLength = pathElement.getTotalLength();
      extensionPath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(animationDuration)
        .delay(animationDuration) // 메인 라인 후에 시작
        .ease(d3.easeQuadOut)
        .attr('stroke-dashoffset', 0)
        .attr('stroke-dasharray', '5,5');
    }
  }
};