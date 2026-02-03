'use client';

import React from 'react';
import { BarChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';


export default function StackedExample() {



  const code = `import { BarChart } from '@beaubrain/chart-lib-react'

<BarChart
  data={data}
  config={{
    width: 800,
    height: 400,
    stacked: true,
    showLegend: true,
    legendPosition: 'top',
    showValues: false
  }}
/>`;

  const data = [{
    'x': 'Jan',
    'value': 52,
    'group': 'Desktop',
    'date': 'Tue Jan 20 2026'
  }, {
    'x': 'Jan',
    'value': 34,
    'group': 'Mobile',
    'date': 'Tue Jan 20 2026'
  }, {
    'x': 'Jan',
    'value': 120,
    'group': 'Tablet',
    'date': 'Tue Jan 20 2026'
  },
  {
    'x': 'Jan',
    'value': 44,
    'group': 'Mobile2',
    'date': 'Tue Jan 20 2026'

  }, {
    'x': 'Jan',
    'value': 23,
    'group': 'Mobile3',
    'date': 'Tue Jan 20 2026'
  }];

  return (
    <ExampleLayout
      type="bar"
      title="Stacked Bar Chart"
      description="Multiple series stacked on top of each other"
    >
      <ChartContainer title="Stacked Bars - Vertical">
        <BarChart
          data={data}
          config={{
            stacked: true,
            showValues: true,
            showLegend: false,
            valuePosition: 'middle',
            valueColor: 'white',
          }}
        />
      </ChartContainer>

      <ChartContainer title="Stacked Bars - Horizontal">
        <BarChart
          data={data}
          config={{
            orientation: 'horizontal',
            stacked: true,
            showValues: true,
            showLegend: false,
            valuePosition: 'middle',
            valueColor: 'white',
          }}
        />
      </ChartContainer>

      <ChartContainer title="Stacked Bars with Values">
        <BarChart
          data={data}
          config={{
            stacked: true,
            showValues: true,
            showLegend: false,
            valuePosition: 'middle',
            valueColor: 'white',

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