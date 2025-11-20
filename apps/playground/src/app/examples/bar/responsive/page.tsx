'use client';

import React from 'react';
import { BarChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
import { generateBarChartData } from '@/utils/generateData';

export default function ResponsiveExample() {
  const categories = ['Jan', 'Feb', 'Mar'];
  const data = generateBarChartData(categories, 100, 25);

  const code = `import { BarChart } from '@beaubrain/chart-lib-react'

// Chart will automatically resize with container
<BarChart
  data={data}
  responsive={true}
  config={{
    showLegend: true
  }}
/>`;

  return (
    <ExampleLayout
      type="bar"
      title="Responsive Charts"
      description="Charts that automatically adapt to container size"
    >
      <ChartContainer title="Responsive Chart - Try resizing your browser">

        <BarChart
          data={data}
          responsive={true}
          config={{
            showLegend: true
          }}
        />

      </ChartContainer>

      <div className="grid grid-cols-2 gap-4">
        <ChartContainer title="Small Container">
          <BarChart
            data={data}
            responsive={true}
          />

        </ChartContainer>

        <ChartContainer title="Small Container">

          <BarChart
            data={data}
            responsive={true}
            config={{
              orientation: 'horizontal'
            }}
          />

        </ChartContainer>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  );
}