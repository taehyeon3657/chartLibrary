'use client';

import React from 'react';
import { BarChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
import { generateMultiSeriesBarData } from '@/utils/generateData';

export default function ThemesExample() {
  const categories = ['Product A', 'Product B', 'Product C', 'Product D'];
  const series = ['Q1', 'Q2', 'Q3'];
  const data = generateMultiSeriesBarData(categories, series, 100, 20);

  const code = `import { BarChart } from '@beaubrain/chart-lib-react'

// Light theme
<BarChart data={data} theme="light" />

// Dark theme
<BarChart data={data} theme="dark" />

// Colorful theme
<BarChart data={data} theme="colorful" />`;

  return (
    <ExampleLayout
      type="bar"
      title="Theme Variations"
      description="Pre-built themes for different visual styles"
    >
      <ChartContainer title="Light Theme">
        <BarChart
          data={data}
          theme="light"
          config={{
            width: 800,
            height: 300,
            grouped: true,
            showLegend: true
          }}
        />
      </ChartContainer>

      <ChartContainer title="Dark Theme">
        <div className="bg-gray-900 p-4 rounded">
          <BarChart
            data={data}
            theme="dark"
            config={{
              width: 800,
              height: 300,
              grouped: true,
              showLegend: true
            }}
          />
        </div>
      </ChartContainer>

      <ChartContainer title="Colorful Theme">
        <BarChart
          data={data}
          theme="colorful"
          config={{
            width: 800,
            height: 300,
            grouped: true,
            showLegend: true
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