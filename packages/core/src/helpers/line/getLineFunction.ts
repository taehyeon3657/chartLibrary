import * as d3 from 'd3';

export const getCurveFunction = (curveType: string): d3.CurveFactory => {
  const curveMap: Record<string, d3.CurveFactory> = {
    linear: d3.curveLinear,
    monotoneX: d3.curveMonotoneX,
    monotoneY: d3.curveMonotoneY,
    cardinal: d3.curveCardinal,
    catmullRom: d3.curveCatmullRom,
    step: d3.curveStep,
    stepBefore: d3.curveStepBefore,
    stepAfter: d3.curveStepAfter,
  };

  return curveMap[curveType] || d3.curveMonotoneX;
};