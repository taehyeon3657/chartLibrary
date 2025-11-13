# Chart Library
D3.js와 모듈러 아키텍처로 구축된 현대적이고 TypeScript 우선 차트 라이브러리입니다. 아름답고 인터랙티브한 차트를 쉽게 만들어보세요.

## 🚀 주요 기능

- **TypeScript 네이티브**: 완전한 타입 안전성과 뛰어난 개발 경험
- **모듈러 아키텍처**: 필요한 것만 가져와서 사용
- **다양한 차트 타입**: 선형, 막대, 원형, 영역 차트 (더 많은 타입이 곧 추가됩니다)
- **D3.js 기반**: D3.js의 강력함과 유연성을 활용
- **인터랙티브**: 내장된 hover, 클릭, 선택 상호작용
- **반응형**: 자동 크기 조정 및 모바일 친화적
- **커스터마이징 가능**: 광범위한 테마 및 스타일링 옵션
- **애니메이션 지원**: 부드러운 전환 및 애니메이션
- **접근성**: ARIA 레이블 및 키보드 내비게이션
- **내보내기 기능**: PNG, SVG, PDF로 차트 내보내기

## 📦 설치

```bash
# npm 사용
npm install @beaubrain/charts

# pnpm 사용
pnpm add @beaubrain/charts

# yarn 사용
yarn add @beaubrain/charts
```

### peer 종속성
필수 peer 종속성을 설치해야 합니다:
```bash
npm install d3@^7.0.0
```

## 🎯 빠른 시작

### 기본 선형 차트
```typescript
import { LineChart, ChartFactory } from '@beaubrain/charts';

// 샘플 데이터
const data = [
  { date: new Date('2023-01-01'), value: 100, group: 'Series A' },
  { date: new Date('2023-01-02'), value: 120, group: 'Series A' },
  { date: new Date('2023-01-03'), value: 90, group: 'Series A' },
];

// 차트 생성
const container = document.getElementById('chart-container');
const chart = new LineChart(container, {
  width: 800,
  height: 400,
  showDots: true,
  enableAnimation: true,
})
.setData(data)
.render();
```

### Chart Factory 사용
```typescript
import { ChartFactory } from '@beaubrain/charts';

// 팩토리를 사용한 빠른 생성
const chart = ChartFactory.createLineChart(
  document.getElementById('chart-container'),
  data,
  {
    title: '시간별 매출',
    showLegend: true,
    enableAnimation: true,
  }
);
```

## 📊 차트 타입

### 선형 차트
시계열 데이터와 트렌드 시각화에 완벽합니다.
```typescript
const config = {
  lineColors: ['#3b82f6', '#ef4444', '#10b981'],
  lineWidth: 2,
  enableCurve: true,
  curveType: 'monotoneX',
  showDots: true,
  showAreaFill: false,
  showLegend: true,
};

const lineChart = new LineChart(container, config);
```

### 반응형 차트
```typescript
const chart = ChartFactory.createResponsive(
  'line',
  container,
  data,
  {
    title: '반응형 차트',
    responsive: true,
  }
);
```

### 테마 차트
```typescript
const chart = ChartFactory.createWithTheme(
  'line',
  container,
  data,
  'dark', // 'light', 'dark', 또는 'colorful'
  {
    title: '다크 테마 차트',
  }
);
```

## 🎨 커스터마이징

### 설정 옵션
```typescript
interface LineChartConfig {
  // 크기
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };

  // 스타일링
  lineColors?: string[];
  lineWidth?: number;
  dotRadius?: number;
  showDots?: boolean;

  // 곡선
  enableCurve?: boolean;
  curveType?: 'linear' | 'monotoneX' | 'monotoneY' | 'natural' | 'step';

  // 영역 채우기
  showAreaFill?: boolean;
  areaFillOpacity?: number;
  areaGradient?: boolean;

  // 축
  showXAxis?: boolean;
  showYAxis?: boolean;
  gridLines?: boolean;

  // 범례 & 제목
  title?: string;
  showLegend?: boolean;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left';

  // 애니메이션
  enableAnimation?: boolean;
  animationDuration?: number;

  // 상호작용
  showTooltip?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
}
```

### 사용자 정의 테마
```typescript
const customConfig = {
  lineColors: ['#8b5cf6', '#06b6d4', '#f97316'],
  gridColor: '#f0f0f0',
  axisColor: '#111',
  titleStyle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold'
  },
};
```

## 🎯 고급 사용법

### 실시간 데이터
```typescript
const realTimeChart = ChartFactory.createRealtime(
  'line',
  container,
  initialData,
  {
    updateInterval: 1000, // 1초마다 업데이트
    title: '실시간 데이터 스트림',
  }
);
```

### 여러 차트가 있는 대시보드
```typescript
const dashboard = ChartFactory.createDashboard(
  container,
  [
    {
      type: 'line',
      data: salesData,
      title: '매출 트렌드',
      config: { showAreaFill: true }
    },
    {
      type: 'line',
      data: visitorData,
      title: '웹사이트 방문자',
      config: { lineColors: ['#ef4444'] }
    }
  ],
  'grid' // 레이아웃: 'grid', 'horizontal', 또는 'vertical'
);
```

### 데이터 비교
```typescript
const comparison = ChartFactory.createComparison(
  container,
  [
    { name: '2023년 1분기', data: q1Data },
    { name: '2023년 2분기', data: q2Data },
    { name: '2023년 3분기', data: q3Data },
  ],
  'overlay' // 또는 'sideBySide'
);
```

### 차트 내보내기
```typescript
// PNG로 내보내기
ChartFactory.exportChart(chart, 'png', 'my-chart');

// SVG로 내보내기
ChartFactory.exportChart(chart, 'svg', 'my-chart');
```

## 🎪 이벤트 & 상호작용

```typescript
chart
  .on('chartHover', (data) => {
    console.log('호버됨:', data);
  })
  .on('chartClick', (data) => {
    console.log('클릭됨:', data);
  })
  .on('legendToggle', ({ group, visible }) => {
    console.log(`${group}이 이제 ${visible ? '보임' : '숨김'} 상태입니다`);
  });
```

### 사용 가능한 이벤트

- `chartHover` - 데이터 포인트 위에 마우스 호버
- `chartClick` - 데이터 포인트 클릭
- `chartMouseenter` / `chartMouseleave` - 마우스 진입/이탈
- `legendToggle` - 범례 항목 클릭
- `rendered` - 차트 렌더링 완료
- `updated` - 차트 업데이트 완료

## 📱 반응형 디자인

차트는 자동으로 컨테이너 크기 변화에 적응합니다:
```typescript
// 반응형 동작 활성화
const chart = new LineChart(container, {
  responsive: true,
  width: undefined, // 컨테이너 너비 사용
  height: undefined, // 컨테이너 높이 사용
});

// 수동 크기 조정
chart.updateConfig({
  width: newWidth,
  height: newHeight
}).update();
```

## 🎨 프리셋

일반적인 사용 사례를 위해 미리 정의된 설정을 사용하세요:
```typescript
// 프리셋 설정 적용
const presetConfig = ChartFactory.applyPreset(baseConfig, 'presentation');
// 사용 가능한 프리셋: 'minimal', 'detailed', 'presentation', 'dashboard'

const chart = new LineChart(container, presetConfig);
```

## 🏗️ 아키텍처

이 라이브러리는 모듈러 모노레포 구조를 따릅니다:
```
packages/
├── types/          # TypeScript 타입 정의
├── core/           # 기본 클래스 및 유틸리티
└── charts/         # 차트 구현
    ├── line/       # 선형 차트 컴포넌트
    ├── shared/     # 공유 유틸리티
    └── ChartFactory.ts # 편의성 팩토리
```

### 주요 컴포넌트

- **BaseChart**: 모든 차트 타입의 기반 클래스
- **ChartFactory**: 차트 생성을 위한 편의 메서드
- **DataProcessor**: 데이터 변환 및 검증
- **ScaleManager**: D3 스케일 생성 및 관리
- **EventManager**: 상호작용 및 이벤트 처리
- **RenderingUtils**: 공통 렌더링 유틸리티

## 🔧 개발

### 설정
```bash
# 저장소 복제
git clone [repository-url]
cd chart-library

# 종속성 설치
pnpm install

# 모든 패키지 빌드
pnpm run build

# 개발 모드
pnpm run dev
```

### 스크립트

- `pnpm run build` - 모든 패키지 빌드
- `pnpm run dev` - 개발 모드
- `pnpm run test` - 테스트 실행
- `pnpm run lint` - 코드 린팅
- `pnpm run clean` - 빌드 아티팩트 정리

### 프로젝트 구조
```
chart-library/
├── packages/
│   ├── types/      # 공유 TypeScript 정의
│   ├── core/       # 기본 기능
│   └── charts/     # 차트 구현
├── package.json    # 루트 패키지 설정
├── turbo.json      # Turborepo 설정
└── pnpm-workspace.yaml # 워크스페이스 설정
```

## 🗺️ 로드맵

### 현재 상태

- ✅ 완전한 기능 세트를 갖춘 선형 차트
- ✅ 모듈러 아키텍처
- ✅ TypeScript 지원
- ✅ 이벤트 시스템
- ✅ 내보내기 기능

### 곧 출시 예정

- 막대 차트
- 원형 차트
- 영역 차트
- 산점도
- 모바일 최적화
- 더 많은 테마 및 프리셋
- 인터랙티브 문서

## 🏆 감사의 말

- D3.js로 구축
- 현대적인 차트 라이브러리에서 영감을 받음
- TypeScript로 개발
- Turborepo로 관리

---
