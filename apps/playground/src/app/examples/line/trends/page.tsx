'use client';

import React from 'react';
import { LineChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
import { generateMultiSeriesData } from '@/utils/generateData';

export default function TrendsExample() {
  const data = generateMultiSeriesData(30, ['Actual Data']);

  const code = `import { LineChart } from '@beaubrain/chart-lib-react'

<LineChart
  data={data}
  config={{
    width: 800,
    height: 400,
    showTrendExtension: true,
    trendExtensionLength: 10, // days
    trendExtensionOpacity: 0.6,
    trendAnalysisPoints: 5, // use last 5 points for trend
    showLegend: true,
    lineWidth: 2
  }}
/>`;

  return (
    <ExampleLayout
      type="line"
      title="Trend Extension Lines"
      description="Predict future trends based on recent data"
    >
      <ChartContainer title="Chart with Trend Predictions">
        <LineChart
          data={data}
          config={{
            width: 800,
            height: 400,
            showTrendExtension: true,
            trendExtensionLength: 10,
            trendExtensionOpacity: 0.6,
            trendAnalysisPoints: 5,
            showLegend: true,
            lineWidth: 2,
            showDots: true,
            dotRadius: 3
          }}
        />
      </ChartContainer>

      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">How It Works</h4>
        <p className="text-blue-800 text-sm">
          The trend extension uses linear regression on the last N data points
          (configured by <code className="bg-blue-100 px-1 rounded">trendAnalysisPoints</code>)
          to project future values. The dashed line shows the predicted trend.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  );
}