'use client';

import React from 'react';
import { BarChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
import { generateBarChartData } from '@/utils/generateData';

export default function PresetsExample() {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = generateBarChartData(categories, 100, 20);

  const code = `import { BarChart } from '@beaubrain/chart-lib-react'

// Minimal preset - Clean and simple
<BarChart data={data} preset="minimal" />

// Detailed preset - All features enabled
<BarChart data={data} preset="detailed" />

// Presentation preset - Bold and eye-catching
<BarChart data={data} preset="presentation" />

// Dashboard preset - Optimized for dashboards
<BarChart data={data} preset="dashboard" />`;

  return (
    <ExampleLayout
      type="bar"
      title="Configuration Presets"
      description="Pre-configured chart styles for different use cases"
    >
      <ChartContainer title="Minimal Preset">
        <BarChart
          data={data}
          preset="minimal"
        />
      </ChartContainer>

      <ChartContainer title="Detailed Preset">
        <BarChart
          data={data}
          preset="detailed"
        />
      </ChartContainer>

      <ChartContainer title="Presentation Preset">
        <BarChart
          data={data}
          preset="presentation"
        />
      </ChartContainer>

      <ChartContainer title="Dashboard Preset">
        <BarChart
          data={data}
          preset="dashboard"
        />
      </ChartContainer>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  );
}