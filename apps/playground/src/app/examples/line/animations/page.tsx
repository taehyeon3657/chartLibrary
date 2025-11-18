'use client';

import React from 'react';
import { useState } from 'react';
import { LineChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
import { generateTimeSeriesData } from '@/utils/generateData';

export default function AnimationsExample() {
  const [data, setData] = useState(generateTimeSeriesData(30));

  const regenerateData = () => {
    setData(generateTimeSeriesData(30, 100, 15));
  };

  const code = `import { LineChart } from '@beaubrain/chart-lib-react'

<LineChart
  data={data}
  config={{
    width: 800,
    height: 400,
    enableAnimation: true,
    animationDuration: 1000,
    showDots: true,
    dotRadius: 4
  }}
/>`;

  return (
    <ExampleLayout
      type="line"
      title="Animated Charts"
      description="Charts with smooth animations and transitions"
    >
      <ChartContainer>
        <div className="mb-4">
          <button
            onClick={regenerateData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Regenerate Data (Watch Animation)
          </button>
        </div>

        <LineChart
          data={data}
          config={{
            width: 800,
            height: 400,
            enableAnimation: true,
            animationDuration: 1000,
            showDots: true,
            dotRadius: 4
          }}
        />
      </ChartContainer>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  );
}