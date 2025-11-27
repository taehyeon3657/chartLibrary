'use client';

import React from 'react';
import { BarChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
import { generateMultiSeriesBarData } from '@/utils/generateData';

export default function GroupedExample() {
  const categories = ['Q1', 'Q2', 'Q3', 'Q4'];
  const series = ['Sales', 'Revenue', 'Profit'];
  const data = generateMultiSeriesBarData(categories, series, 100, 25);

  const code = `import { BarChart } from '@beaubrain/chart-lib-react'

const data = [
  { x: 'Q1', value: 100, group: 'Sales',},
  { x: 'Q1', value: 80, group: 'Revenue',},
  { x: 'Q1', value: 60, group: 'Profit', },
  { x: 'Q2', value: 120, group: 'Sales',},
  { x: 'Q2', value: 90, group: 'Revenue',},
  { x: 'Q2', value: 70, group: 'Profit', },
  { x: 'Q3', value: 150, group: 'Sales',},
  { x: 'Q3', value: 110, group: 'Revenue',},
  { x: 'Q3', value: 80, group: 'Profit', },
  // ...
]

function MyChart() {
  return (
    <BarChart
      data={data}
      config={{
        width: 800,
        height: 400,
        grouped: true,
        showLegend: true,
        legendPosition: 'top'
      }}
    />
  )
}`;

  return (
    <ExampleLayout
      type="bar"
      title="Grouped Bar Chart"
      description="Multiple series displayed side by side"
    >
      <ChartContainer title="Grouped Bars - Vertical">
        <BarChart
          data={data}
          config={{
            width: 800,
            grouped: true,
            barWidth: 30,
            barGroupPadding: '15px',
            showBaseline: true,
            showValues: true,
            baselineWidth: 1,
            valuePosition: 'outside',
            barBorderRadius: 3,
            showLegend: false
          }}
        />
      </ChartContainer>

      <ChartContainer title="Grouped Bars - Horizontal">
        <BarChart
          data={data}
          config={{
            orientation: 'horizontal',
            grouped: true,
            legendPosition: 'top',
            barGroupPadding: 1,
            barPadding: 0.2,
            showValues: true,
            valuePosition: 'outside',
            barBorderRadius: 3,
            showLegend: false
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