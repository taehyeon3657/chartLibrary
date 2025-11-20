'use client';

import React from 'react';
import { BarChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
import { generateBarChartData } from '@/utils/generateData';

export default function HorizontalExample() {
  const categories = ['Product A', 'Product B', 'Product C'];
  const data = generateBarChartData(categories, 100, 25);

  const code = `import { BarChart } from '@beaubrain/chart-lib-react'

<BarChart
    data={data}
      config={{
        margin: { top: 20, right: 30, bottom: 40, left: 90 },
        width: 700,
        height: 500,
        orientation: 'horizontal',
        barColors: ['#8b5cf6'],
        showValues: true,
        valuePosition: 'outside',
        xAxisLabelPosition: 'center',
      }}
/>`;

  return (
    <ExampleLayout
      type="bar"
      title="Horizontal Bar Chart"
      description="Bar chart with horizontal orientation"
    >
      <ChartContainer title="Horizontal Bars">
        <BarChart
          data={data}
          config={{
            margin: { top: 20, right: 30, bottom: 40, left: 90 },
            orientation: 'horizontal',
            barColors: ['#8b5cf6'],
            showValues: true,
            valuePosition: 'outside',
            xAxisLabelPosition: 'center',
          }}
        />
      </ChartContainer>

      <ChartContainer title="With Custom Colors">
        <BarChart
          data={data}
          config={{
            margin: { top: 20, right: 30, bottom: 40, left: 90 },
            orientation: 'horizontal',
            barColors: ['#06b6d4'],
            showValues: true,
            valuePosition: 'middle',
            valueColor: 'white',
            barBorderRadius: 2,
            yAxisLabelPosition: 'center',
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