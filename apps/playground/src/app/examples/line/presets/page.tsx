'use client';

import React from 'react';
import { LineChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
import { generateMultiSeriesData } from '@/utils/generateData';

export default function PresetsExample() {
  const data = generateMultiSeriesData(30, ['Data']);

  const code = `import { LineChart } from '@beaubrain/chart-lib-react'

// Minimal preset - Clean and simple
<LineChart data={data} preset="minimal" />

// Detailed preset - All features enabled
<LineChart data={data} preset="detailed" />

// Presentation preset - Bold and eye-catching
<LineChart data={data} preset="presentation" />

// Dashboard preset - Optimized for dashboards
<LineChart data={data} preset="dashboard" />`;

  return (
    <ExampleLayout
      type="line"
      title="Configuration Presets"
      description="Pre-configured chart styles for different use cases"
    >
      <ChartContainer title="Minimal Preset">
        <LineChart
          data={data}
          preset="minimal"
          config={{ width: 800, height: 250 }}
        />
      </ChartContainer>

      <ChartContainer title="Detailed Preset">
        <LineChart
          data={data}
          preset="detailed"
          config={{ width: 800, height: 250 }}
        />
      </ChartContainer>

      <ChartContainer title="Presentation Preset">
        <LineChart
          data={data}
          preset="presentation"
          config={{ width: 800, height: 250 }}
        />
      </ChartContainer>

      <ChartContainer title="Dashboard Preset">
        <LineChart
          data={data}
          preset="dashboard"
          config={{ width: 800, height: 250 }}
        />
      </ChartContainer>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  );
}