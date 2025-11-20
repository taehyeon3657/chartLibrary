다음은 제공해주신 코드베이스와 기능 구현 상태를 바탕으로 최신화된 `README.md` 파일 내용입니다. 실제로 구현되어 있고 사용 가능한 **Line Chart**와 **Bar Chart**를 중심으로 내용을 구성했습니다.

-----

# Chart Library

D3.js와 React를 기반으로 구축된 모듈식 차트 라이브러리입니다. TypeScript를 기본으로 지원하며, 선형(Line) 차트와 막대(Bar) 차트를 통해 데이터를 시각화할 수 있습니다.

## 🚀 주요 기능

  - **React 컴포넌트 지원**: React 환경에서 쉽게 사용할 수 있는 래퍼 컴포넌트 제공
  - **TypeScript 기반**: 강력한 타입 정의 지원 (`@beaubrain/chart-lib-types`)
  - **주요 차트 지원**:
      - **Line Chart**: 기본 라인, 멀티 시리즈, 곡선(Curve), 영역 채우기(Area Fill), 추세선(Trend line)
      - **Bar Chart**: 수직/수평 모드, 그룹화(Grouped), 스택(Stacked)
  - **다양한 커스터마이징**: 축(Axis), 그리드, 범례(Legend), 툴팁(Tooltip), 폰트 스타일링
  - **인터랙티브**: Hover, Click 이벤트 및 애니메이션 지원
  - **내보내기 기능**: 차트를 PNG, SVG 등으로 내보내기 지원

## 📦 설치

```bash
# npm
npm install @beaubrain/chart-lib-react @beaubrain/chart-lib-types

# pnpm
pnpm add @beaubrain/chart-lib-react @beaubrain/chart-lib-types

# yarn
yarn add @beaubrain/chart-lib-react @beaubrain/chart-lib-types
```

## 🎯 사용 방법 (React)

### 1\. Line Chart (선형 차트)

시계열 데이터나 추세를 표현하기 적합합니다.

```tsx
import { LineChart } from '@beaubrain/chart-lib-react';

const data = [
  { date: new Date('2024-01-01'), value: 100, group: 'Sales' },
  { date: new Date('2024-01-02'), value: 120, group: 'Sales' },
  { date: new Date('2024-01-03'), value: 115, group: 'Sales' },
];

function MyLineChart() {
  return (
    <LineChart
      data={data}
      config={{
        width: 800,
        height: 400,
        // 스타일 설정
        lineColors: ['#3b82f6'],
        lineWidth: 2,
        showDots: true,
        dotRadius: 4,
        // 곡선 설정 ('linear' | 'monotoneX' | 'step' 등)
        enableCurve: true,
        curveType: 'monotoneX',
        // 영역 채우기
        showAreaFill: true,
        areaFillOpacity: 0.1,
        // 기타
        showLegend: true,
        enableAnimation: true,
      }}
    />
  );
}
```

### 2\. Bar Chart (막대 차트)

범주형 데이터 비교에 적합합니다. 수직, 수평, 스택, 그룹화 모드를 지원합니다.

```tsx
import { BarChart } from '@beaubrain/chart-lib-react';

const data = [
  { x: 'Jan', value: 100, group: 'Product A' },
  { x: 'Feb', value: 120, group: 'Product A' },
  { x: 'Jan', value: 80, group: 'Product B' },
  { x: 'Feb', value: 90, group: 'Product B' },
];

function MyBarChart() {
  return (
    <BarChart
      data={data}
      config={{
        width: 800,
        height: 400,
        margin: { top: 20, right: 30, bottom: 40, left: 60 },
        // 방향 설정 ('vertical' | 'horizontal')
        orientation: 'vertical',
        // 그룹화 또는 스택 설정
        grouped: true,
        // stacked: true,

        // 스타일
        barColors: ['#3b82f6', '#10b981'],
        barBorderRadius: 4,

        // 값 표시
        showValues: true,
        valuePosition: 'top',
      }}
    />
  );
}
```

## 🎨 주요 설정 옵션 (Config)

모든 차트는 `config` props를 통해 세부 사항을 제어할 수 있습니다.

### 공통 설정

| 속성 | 설명 | 타입 |
|------|------|------|
| `width` / `height` | 차트의 너비와 높이 | `number` |
| `margin` | 차트 여백 | `{ top, right, bottom, left }` |
| `title` | 차트 제목 | `string` |
| `showLegend` | 범례 표시 여부 | `boolean` |
| `legendPosition` | 범례 위치 | `'top' | 'bottom' | 'left' | 'right'` |
| `showTooltip` | 툴팁 표시 여부 | `boolean` |
| `enableAnimation` | 애니메이션 활성화 | `boolean` |
| `fonts` | 폰트 스타일 설정 (축, 제목, 범례 등) | `FontConfig` |

### Line Chart 전용

| 속성 | 설명 |
|------|------|
| `curveType` | 선의 곡률 타입 (`monotoneX`, `linear`, `step` 등) |
| `showDots` | 데이터 포인트 점 표시 여부 |
| `dotRadius` | 점의 크기 |
| `showAreaFill` | 선 아래 영역 채우기 여부 |
| `showTrendExtension` | 추세선(점선) 확장 표시 여부 |

### Bar Chart 전용

| 속성 | 설명 |
|------|------|
| `orientation` | 바의 방향 (`vertical`, `horizontal`) |
| `grouped` | 그룹화된 막대 차트 사용 여부 |
| `stacked` | 누적(스택) 막대 차트 사용 여부 |
| `barBorderRadius` | 막대 모서리 둥글기 |
| `showValues` | 막대 위에 값 표시 여부 |
| `showBaseline` | 기준선 표시 여부 |

## 🎪 이벤트 핸들링

차트의 상호작용을 위해 다음과 같은 이벤트 props를 제공합니다.

```tsx
<LineChart
  data={data}
  onChartClick={(e) => console.log('클릭:', e.data)}
  onChartHover={(e) => console.log('호버:', e.data)}
  onLegendToggle={(e) => console.log('범례 토글:', e.group, e.visible)}
/>
```

## 🛠️ 프로젝트 구조

이 라이브러리는 모노레포 구조로 되어 있습니다.

  - **`packages/react`**: React 컴포넌트 (`LineChart`, `BarChart`)
  - **`packages/charts`**: 실제 차트 구현 로직 (D3.js 기반)
  - **`packages/core`**: 공통 로직, 헬퍼 함수, 기본 클래스
  - **`packages/types`**: TypeScript 타입 정의
  - **`apps/playground`**: 예제 및 테스트용 Next.js 애플리케이션

## 📝 라이선스

MIT