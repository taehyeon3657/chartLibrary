/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProcessedDataPoint } from '@beaubrain/chart-lib-types';
import * as d3 from 'd3';

/**
 * 공통 렌더링 유틸리티 함수들
 *
 * 주요 기능:
 * - D3 헬퍼 함수들
 * - 애니메이션 유틸리티
 * - 그라데이션, 패턴 생성
 * - 접근성 관련 유틸리티
 * - 폰트 상속 관련 유틸리티
 */

export class RenderingUtils {
  /**
   * 곡선 타입을 D3 CurveFactory로 변환
   */
  static getCurveFactory(curveType: string): d3.CurveFactory {
    const curveMap: Record<string, d3.CurveFactory> = {
      linear: d3.curveLinear,
      monotoneX: d3.curveMonotoneX,
      monotoneY: d3.curveMonotoneY,
      cardinal: d3.curveCardinal,
      catmullRom: d3.curveCatmullRom,
      step: d3.curveStep,
      stepBefore: d3.curveStepBefore,
      stepAfter: d3.curveStepAfter,
      natural: d3.curveNatural,
      basis: d3.curveBasis,
    };

    return curveMap[curveType] || d3.curveMonotoneX;
  }

  /**
   * 그라데이션 생성
   */
  static createGradient(
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
    id: string,
    stops: Array<{ offset: string; color: string; opacity?: number }>
  ): string {
    const gradient = defs
      .append('linearGradient')
      .attr('id', id)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    stops.forEach(stop => {
      gradient
        .append('stop')
        .attr('offset', stop.offset)
        .attr('stop-color', stop.color)
        .attr('stop-opacity', stop.opacity ?? 1);
    });

    return id;
  }

  /**
   * 영역 그라데이션 생성 (자동 색상 계산)
   */
  static createAreaGradient(
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
    baseColor: string,
    groupName: string,
    opacity: number = 0.3
  ): string {
    const gradientId = `area-gradient-${groupName.replace(/\s+/g, '-')}-${Date.now()}`;

    return this.createGradient(defs, gradientId, [
      { offset: '0%', color: baseColor, opacity },
      { offset: '100%', color: baseColor, opacity: 0 }
    ]);
  }

  /**
   * 클립 패스 생성
   */
  static createClipPath(
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
    id: string,
    width: number,
    height: number
  ): string {
    defs
      .append('clipPath')
      .attr('id', id)
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);

    return id;
  }

  /**
   * 라인 애니메이션 (그리기 효과)
   */
  static animatePath(
    path: d3.Selection<SVGPathElement, unknown, null, undefined>,
    duration: number = 300,
    easing: (t: number) => number = d3.easeQuadOut
  ): void {
    const pathElement = path.node();
    if (!pathElement) return;

    const totalLength = pathElement.getTotalLength();

    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(duration)
      .ease(easing)
      .attr('stroke-dashoffset', 0)
      .on('end', function() {
        // 애니메이션 완료 후 dash 속성 제거
        d3.select(this).attr('stroke-dasharray', null);
      });
  }

  /**
   * 영역 애니메이션 (클립 패스 이용)
   */
  static animateArea(
    area: d3.Selection<SVGPathElement, unknown, null, undefined>,
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
    width: number,
    height: number,
    duration: number = 300
  ): void {
    const clipId = `clip-${Date.now()}`;
    this.createClipPath(defs, clipId, 0, height);

    const clipRect = defs.select(`#${clipId} rect`);

    area.attr('clip-path', `url(#${clipId})`);

    clipRect
      .transition()
      .duration(duration)
      .ease(d3.easeQuadOut)
      .attr('width', width)
      .on('end', function() {
        // 애니메이션 완료 후 클립 패스 제거
        area.attr('clip-path', null);
        defs.select(`#${clipId}`).remove();
      });
  }

  /**
   * 점 애니메이션 (크기 변화)
   */
  static animateDots(
    dots: d3.Selection<SVGCircleElement, {x: number, y: number, data: ProcessedDataPoint}, SVGGElement, unknown>,
    finalRadius: number,
    duration: number = 300,
    delay: number = 0
  ): void {
    dots
      .attr('r', 0)
      .transition()
      .delay(delay)
      .duration(duration)
      .ease(d3.easeBounceOut)
      .attr('r', finalRadius);
  }

  /**
   * 색상 투명도 조정
   */
  static adjustColorOpacity(color: string, opacity: number): string {
    const d3Color = d3.color(color);
    if (d3Color) {
      d3Color.opacity = opacity;
      return d3Color.toString();
    }
    return color;
  }

  /**
   * 색상 밝기 조정 (호버 효과 등)
   */
  static adjustColorBrightness(color: string, factor: number): string {
    const d3Color = d3.color(color);
    if (d3Color && 'brighter' in d3Color) {
      return factor > 0
        ? (d3Color as d3.RGBColor | d3.HSLColor).brighter(factor).toString()
        : (d3Color as d3.RGBColor | d3.HSLColor).darker(-factor).toString();
    }
    return color;
  }

  /**
   * 텍스트 줄임표 처리
   */
  static truncateText(
    text: d3.Selection<SVGTextElement, unknown, null, undefined>,
    maxWidth: number
  ): void {
    text.each(function() {
      const textElement = d3.select(this);
      const textContent = textElement.text();

      while (textElement.node()!.getComputedTextLength() > maxWidth && textContent.length > 0) {
        const shortened = textContent.substring(0, textContent.length - 1);
        textElement.text(shortened + '...');
      }
    });
  }

  /**
   * 접근성: ARIA 라벨 생성
   */
  static createAriaLabel(data: ProcessedDataPoint, type: string): string {
    const value = data.y || data.value || 0;
    const group = data.group || 'Data';
    const date = data.parsedDate ? data.parsedDate.toLocaleDateString() : '';

    switch (type) {
    case 'line':
      return `${group} line chart point: ${value}${date ? ` on ${date}` : ''}`;
    case 'bar':
      return `${group} bar: ${value}${date ? ` for ${date}` : ''}`;
    case 'pie':
      return `${group} pie slice: ${value}`;
    default:
      return `${group}: ${value}`;
    }
  }

  /**
   * 툴팁 위치 계산
   */
  static calculateTooltipPosition(
    event: MouseEvent,
    tooltipWidth: number,
    tooltipHeight: number,
  ): { x: number; y: number } {
    let x = event.clientX + 10;
    let y = event.clientY - 10;

    // 화면 경계 체크
    if (x + tooltipWidth > window.innerWidth) {
      x = event.clientX - tooltipWidth - 10;
    }

    if (y - tooltipHeight < 0) {
      y = event.clientY + 20;
    }

    return { x, y };
  }

  /**
   * 반응형 텍스트 크기 계산
   */
  static calculateResponsiveFontSize(
    containerWidth: number,
    baseSize: number = 12,
    minSize: number = 8,
    maxSize: number = 20
  ): number {
    const scaleFactor = containerWidth / 400; // 400px를 기준으로 스케일
    const calculatedSize = baseSize * scaleFactor;
    return Math.max(minSize, Math.min(maxSize, calculatedSize));
  }

  /**
   * 디바이스 픽셀 비율을 고려한 선명한 렌더링
   */
  static setupHighDPICanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.scale(dpr, dpr);

    return ctx;
  }

  // ============================================
  // 폰트 상속 관련 유틸리티
  // ============================================

  /**
   * 부모 컨테이너의 폰트 설정 가져오기
   *
   * @param element - 폰트를 가져올 HTML 요소
   * @returns 컴퓨팅된 font-family 값
   *
   * @example
   * const font = RenderingUtils.getInheritedFont(container);
   * // 반환값: "Roboto, sans-serif" 또는 "inherit"
   */
  static getInheritedFont(element: HTMLElement): string {
    try {
      const computedStyle = window.getComputedStyle(element);
      const fontFamily = computedStyle.fontFamily;

      // 유효한 폰트가 있으면 반환, 없으면 'inherit'
      return fontFamily && fontFamily !== '' ? fontFamily : 'inherit';
    } catch (error) {
      console.warn('Failed to get inherited font:', error);
      return 'inherit';
    }
  }

  /**
   * SVG 요소에 폰트 상속 설정 적용
   *
   * @param svg - 폰트를 적용할 SVG selection
   * @param container - 폰트를 가져올 컨테이너 요소
   *
   * @example
   * RenderingUtils.applyInheritedFont(svg, container);
   */
  static applyInheritedFont(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    container: HTMLElement
  ): void {
    const fontFamily = this.getInheritedFont(container);

    // SVG 내의 모든 텍스트 요소에 폰트 적용
    svg.selectAll('text')
      .style('font-family', fontFamily);
  }

  /**
   * 특정 D3 selection에 폰트 상속 적용
   *
   * @param selection - 폰트를 적용할 D3 selection
   * @param fontFamily - 적용할 font-family (기본값: 'inherit')
   *
   * @example
   * RenderingUtils.applyFontToSelection(chartArea, 'Roboto, sans-serif');
   */
  static applyFontToSelection(
    selection: d3.Selection<any, any, any, any>,
    fontFamily: string = 'inherit'
  ): void {
    selection.selectAll('text')
      .style('font-family', fontFamily);
  }

  /**
   * 컨테이너로부터 전체 폰트 스타일 가져오기
   * font-family, font-size, font-weight 등을 포함
   *
   * @param element - 스타일을 가져올 HTML 요소
   * @returns 폰트 관련 스타일 객체
   */
  static getInheritedFontStyles(element: HTMLElement): {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    fontStyle: string;
    lineHeight: string;
  } {
    try {
      const computedStyle = window.getComputedStyle(element);

      return {
        fontFamily: computedStyle.fontFamily || 'inherit',
        fontSize: computedStyle.fontSize || '12px',
        fontWeight: computedStyle.fontWeight || 'normal',
        fontStyle: computedStyle.fontStyle || 'normal',
        lineHeight: computedStyle.lineHeight || 'normal'
      };
    } catch (error) {
      console.warn('Failed to get inherited font styles:', error);
      return {
        fontFamily: 'inherit',
        fontSize: '12px',
        fontWeight: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal'
      };
    }
  }

  /**
   * SVG에 전체 폰트 스타일 적용
   *
   * @param svg - 스타일을 적용할 SVG selection
   * @param container - 스타일을 가져올 컨테이너
   */
  static applyInheritedFontStyles(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    container: HTMLElement
  ): void {
    const styles = this.getInheritedFontStyles(container);

    svg.selectAll('text')
      .style('font-family', styles.fontFamily)
      .style('font-size', styles.fontSize)
      .style('font-weight', styles.fontWeight)
      .style('font-style', styles.fontStyle);
  }

  // ============================================
  // 성능 최적화
  // ============================================

  /**
   * 성능 최적화: RAF를 이용한 애니메이션 큐
   */
  private static animationQueue: Array<() => void> = [];
  private static isProcessing = false;

  static queueAnimation(callback: () => void): void {
    this.animationQueue.push(callback);

    if (!this.isProcessing) {
      this.processAnimationQueue();
    }
  }

  private static processAnimationQueue(): void {
    this.isProcessing = true;

    const processNext = () => {
      const callback = this.animationQueue.shift();

      if (callback) {
        callback();
        requestAnimationFrame(processNext);
      } else {
        this.isProcessing = false;
      }
    };

    requestAnimationFrame(processNext);
  }
}