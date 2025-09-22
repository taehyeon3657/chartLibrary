import { ProcessedDataPoint } from '@charts-library/types';
import * as d3 from 'd3';


export const createAreaGradient = (
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  group: string,
  color: string,
  opacity: number
): string => {
  const gradientId = `area-gradient-${group.replace(/\s+/g, '-')}-${Date.now()}`;

  const gradient = defs
    .append('linearGradient')
    .attr('id', gradientId)
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', '0%')
    .attr('x2', 0)
    .attr('y2', '100%');

  gradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', color)
    .attr('stop-opacity', opacity);

  gradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', color)
    .attr('stop-opacity', 0);

  return gradientId;
};

const renderAreaFill = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  groupData: ProcessedDataPoint[],
  group: string,
  color: string,
  area: d3.Area<ProcessedDataPoint>,
  areaFillOpacity: number,
  enableAnimation: boolean,
  animationDuration: number,
  innerWidth: number,
) => {
  const gradientId = createAreaGradient(defs, group, color, areaFillOpacity);

  const areaPath = g
    .append('path')
    .datum(groupData)
    .attr('class', `area area-${group.replace(/\s+/g, '-')}`)
    .attr('fill', `url(#${gradientId})`)
    .attr('stroke', 'none')
    .attr('d', area);

  if (enableAnimation) {
    const clipPathId = `clip-${group.replace(/\s+/g, '-')}-${Date.now()}`;
    const clipPath = defs.append('clipPath').attr('id', clipPathId);

    clipPath
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', '100%')
      .transition()
      .duration(animationDuration)
      .ease(d3.easeQuadOut)
      .attr('width', innerWidth);

    areaPath.attr('clip-path', `url(#${clipPathId})`);
  }

  return areaPath;
};