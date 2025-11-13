import { EventEmitter } from '@beaubrain/core';
import type { AllChartEvents, ProcessedDataPoint } from '@beaubrain/types';

/**
 * 차트 상호작용 및 이벤트를 관리하는 헤드리스 클래스
 *
 * 주요 기능:
 * - 마우스/터치 이벤트 추상화
 * - 호버, 클릭, 선택 상태 관리
 * - 키보드 접근성 지원
 * - 이벤트 디바운싱/쓰로틀링
 */

export interface InteractionState {
  hoveredData: ProcessedDataPoint | null;
  selectedData: ProcessedDataPoint[];
  selectedGroups: Set<string>;
  isInteracting: boolean;
}

export interface InteractionOptions {
  enableHover?: boolean;
  enableClick?: boolean;
  enableSelection?: boolean;
  enableKeyboard?: boolean;
  hoverDelay?: number;
  multiSelect?: boolean;
}

export class EventManager extends EventEmitter<AllChartEvents> {
  private state: InteractionState;
  private options: InteractionOptions;
  private container: HTMLElement | null = null;
  private data: ProcessedDataPoint[] = [];

  // 디바운싱/쓰로틀링용
  private hoverTimeout: NodeJS.Timeout | null = null;

  constructor(options: InteractionOptions = {}) {
    super();

    this.options = {
      enableHover: true,
      enableClick: true,
      enableSelection: false,
      enableKeyboard: true,
      hoverDelay: 50,
      multiSelect: false,
      ...options
    };

    this.state = {
      hoveredData: null,
      selectedData: [],
      selectedGroups: new Set(),
      isInteracting: false
    };
  }

  /**
   * 컨테이너 요소 및 데이터 설정
   */
  setup(container: HTMLElement, data: ProcessedDataPoint[]): this {
    this.container = container;
    this.data = data;
    this.attachEventListeners();
    return this;
  }

  /**
   * 이벤트 리스너 연결
   */
  private attachEventListeners(): void {
    if (!this.container) return;

    // 마우스 이벤트
    if (this.options.enableHover) {
      this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }

    if (this.options.enableClick) {
      this.container.addEventListener('click', this.handleClick.bind(this));
    }

    // 키보드 이벤트 (접근성)
    if (this.options.enableKeyboard) {
      this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.container.setAttribute('tabindex', '0'); // 포커스 가능하게
    }

    // 터치 이벤트 (모바일 지원)
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  /**
   * 마우스 이동 처리
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.options.enableHover) return;

    // 디바운싱
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    this.hoverTimeout = setTimeout(() => {
      this.processHover(event);
    }, this.options.hoverDelay);
  }

  /**
   * 호버 처리 로직
   */
  private processHover(event: MouseEvent): void {
    const hoveredData = this.findDataAtPosition(event);

    // 상태 변경이 있는 경우만 이벤트 발생
    if (hoveredData !== this.state.hoveredData) {
      const previousData = this.state.hoveredData;
      this.state.hoveredData = hoveredData;

      if (previousData) {
        this.emit('chartMouseleave', {
          data: previousData.originalData || previousData,
          index: this.data.indexOf(previousData),
          group: previousData.group,
          originalEvent: event
        });
      }

      if (hoveredData) {
        this.emit('chartMouseenter', {
          data: hoveredData.originalData || hoveredData,
          index: this.data.indexOf(hoveredData),
          group: hoveredData.group,
          originalEvent: event
        });

        this.emit('chartHover', {
          data: hoveredData.originalData || hoveredData,
          index: this.data.indexOf(hoveredData),
          group: hoveredData.group,
          originalEvent: event
        });
      }
    }

    // 항상 mousemove 이벤트 발생
    if (hoveredData) {
      this.emit('chartMousemove', {
        data: hoveredData.originalData || hoveredData,
        index: this.data.indexOf(hoveredData),
        group: hoveredData.group,
        originalEvent: event
      });
    }
  }

  /**
   * 마우스 나감 처리
   */
  private handleMouseLeave(event: MouseEvent): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    if (this.state.hoveredData) {
      this.emit('chartMouseleave', {
        data: this.state.hoveredData.originalData || this.state.hoveredData,
        index: this.data.indexOf(this.state.hoveredData),
        group: this.state.hoveredData.group,
        originalEvent: event
      });

      this.state.hoveredData = null;
    }
  }

  /**
   * 클릭 처리
   */
  private handleClick(event: MouseEvent): void {
    if (!this.options.enableClick) return;

    const clickedData = this.findDataAtPosition(event);

    if (clickedData) {
      // 선택 상태 관리
      if (this.options.enableSelection) {
        this.toggleSelection(clickedData, event.ctrlKey || event.metaKey);
      }

      this.emit('chartClick', {
        data: clickedData.originalData || clickedData,
        index: this.data.indexOf(clickedData),
        group: clickedData.group,
        originalEvent: event
      });
    }
  }

  /**
   * 키보드 처리 (접근성)
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.options.enableKeyboard) return;

    switch (event.code) {
      case 'Enter':
      case 'Space':
        if (this.state.hoveredData) {
          // 키보드로 클릭 시뮬레이션
          this.emit('chartClick', {
            data: this.state.hoveredData.originalData || this.state.hoveredData,
            index: this.data.indexOf(this.state.hoveredData),
            group: this.state.hoveredData.group,
            originalEvent: event as any
          });
        }
        event.preventDefault();
        break;

      case 'Escape':
        this.clearSelection();
        event.preventDefault();
        break;

      case 'ArrowLeft':
      case 'ArrowRight':
        this.navigateData(event.code === 'ArrowRight' ? 1 : -1);
        event.preventDefault();
        break;
    }
  }

  /**
   * 터치 이벤트 처리
   */
  private handleTouchStart(event: TouchEvent): void {
    this.state.isInteracting = true;

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.processHover(mouseEvent);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    this.state.isInteracting = false;

    if (event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      const clickedData = this.findDataAtPosition({
        clientX: touch.clientX,
        clientY: touch.clientY
      } as MouseEvent);

      if (clickedData) {
        this.emit('chartClick', {
          data: clickedData.originalData || clickedData,
          index: this.data.indexOf(clickedData),
          group: clickedData.group,
          originalEvent: event as any
        });
      }
    }
  }

  /**
   * 마우스/터치 위치에서 데이터 찾기 (오버라이드 필요)
   * 각 차트 타입별로 구체적인 히트 테스트 로직 구현
   */
  protected findDataAtPosition(event: { clientX: number; clientY: number }): ProcessedDataPoint | null {
    // 기본 구현 - 실제로는 각 차트에서 오버라이드
    return null;
  }

  /**
   * 선택 상태 토글
   */
  private toggleSelection(data: ProcessedDataPoint, multiSelect: boolean = false): void {
    if (!this.options.enableSelection) return;

    const isSelected = this.state.selectedData.includes(data);

    if (isSelected) {
      // 선택 해제
      this.state.selectedData = this.state.selectedData.filter(d => d !== data);
      this.state.selectedGroups.delete(data.group);
    } else {
      // 선택
      if (!multiSelect && !this.options.multiSelect) {
        this.state.selectedData = [data];
        this.state.selectedGroups.clear();
        this.state.selectedGroups.add(data.group);
      } else {
        this.state.selectedData.push(data);
        this.state.selectedGroups.add(data.group);
      }
    }

    this.emit('selection', {
      selectedData: this.state.selectedData.map(d => d.originalData || d),
      selectedIndices: this.state.selectedData.map(d => this.data.indexOf(d)),
      originalEvent: new Event('selection')
    });
  }

  /**
   * 키보드로 데이터 네비게이션
   */
  private navigateData(direction: number): void {
    if (this.data.length === 0) return;

    let currentIndex = this.state.hoveredData
      ? this.data.indexOf(this.state.hoveredData)
      : -1;

    currentIndex += direction;
    currentIndex = Math.max(0, Math.min(this.data.length - 1, currentIndex));

    const newData = this.data[currentIndex];
    if (newData && newData !== this.state.hoveredData) {
      this.state.hoveredData = newData;

      this.emit('chartHover', {
        data: newData.originalData || newData,
        index: currentIndex,
        group: newData.group,
        originalEvent: new KeyboardEvent('keydown') as any
      });
    }
  }

  /**
   * 선택 상태 초기화
   */
  clearSelection(): void {
    if (this.state.selectedData.length > 0) {
      this.state.selectedData = [];
      this.state.selectedGroups.clear();

      this.emit('selection', {
        selectedData: [],
        selectedIndices: [],
        originalEvent: new Event('clear')
      });
    }
  }

  /**
   * 그룹 토글 (범례 클릭 등)
   */
  toggleGroup(group: string): void {
    const isSelected = this.state.selectedGroups.has(group);

    if (isSelected) {
      this.state.selectedGroups.delete(group);
      this.state.selectedData = this.state.selectedData.filter(d => d.group !== group);
    } else {
      this.state.selectedGroups.add(group);
      const groupData = this.data.filter(d => d.group === group);
      this.state.selectedData.push(...groupData);
    }

    this.emit('legendToggle', {
      group,
      visible: !isSelected,
      originalEvent: new Event('legendToggle')
    });
  }

  /**
   * 현재 상태 반환
   */
  getState(): InteractionState {
    return { ...this.state };
  }

  /**
   * 데이터 업데이트
   */
  updateData(data: ProcessedDataPoint[]): this {
    this.data = data;
    // 기존 선택/호버 상태 초기화
    this.state.hoveredData = null;
    this.state.selectedData = [];
    this.state.selectedGroups.clear();
    return this;
  }

  /**
   * 옵션 업데이트
   */
  updateOptions(newOptions: Partial<InteractionOptions>): this {
    this.options = { ...this.options, ...newOptions };
    return this;
  }

  /**
   * 정리 (메모리 해제)
   */
  destroy(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    if (this.container) {
      this.container.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      this.container.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
      this.container.removeEventListener('click', this.handleClick.bind(this));
      this.container.removeEventListener('keydown', this.handleKeyDown.bind(this));
      this.container.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      this.container.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    this.removeAllListeners();
  }
}