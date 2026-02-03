'use client';

import React from 'react';
import { BarChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
// import { generateBarChartData } from '@/utils/generateData';

export default function BasicExample() {
  // const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  // const data = generateBarChartData(categories, 100, 30);

  const data = [
    { x: 'Jan', value: 100 },
    { x: 'Feb', value: 80},
    { x: 'Mar', value: -3},
    { x: 'Apr', value: 125},
    { x: 'May', value: 60},
    { x: 'Jun', value: 90},
  // ...
  ];

  const code = `import { BarChart } from '@beaubrain/chart-lib-react'

const data = [
    { x: 'Jan', value: 100 },
    { x: 'Feb', value: 80},
    { x: 'Mar', value: 12},
    { x: 'Apr', value: 120},
    { x: 'May', value: 60},
    { x: 'Jun', value: 90},
  // ...
]

function MyChart() {
  return (
    <BarChart
          data={data}
           config={{
            margin: { top: 20, right: 20, bottom: 20, left: 60 },
            responsive: true,
            xAxisLabelPosition: 'center',
            showValues: true,
            showYAxisZero: true,
            horizontalGridLines: false,
            gridLines: true,
            gridLineStyle: 'solid',
            verticalGridLines: true,
            xAxisDisplay: {
              showAxisLine: false,
              showTicks: false,
              showTickLabels: true,
            },
            scale: {
              xAxisPosition: 'bottom',
            },
            fonts: {
              xAxisTickFontSize: 10,
              yAxisTickFontSize: 10,
              xAxisLabelFontSize: 16,
              yAxisLabelFontSize: 16,
              legendFontSize: 8,
              titleFontSize: 18,
              valueFontSize: 12,
              valueFontWeight: 100,
            },
            showLegend: false,
            showBaseline: true,
            baselineValue: 0,
            baselineWidth: 1,
            barBorderRadius: 4,
            valuePosition: 'outside'
          }}
        />

  )
}`;

  return (
    <ExampleLayout
      type="bar"
      title="Basic Bar Chart"
      description="A simple bar chart with default settings"
    >
      <ChartContainer title="Chart">

        <BarChart
          data={data}
          config={{
            margin: { top: 20, right: 20, bottom: 20, left: 60 },
            xAxisLabelPosition: 'center',
            showValues: true,
            showYAxisZero: true,
            horizontalGridLines: false,
            gridLines: true,
            gridLineStyle: 'solid',
            verticalGridLines: true,
            xAxisDisplay: {
              showAxisLine: false,
              showTicks: false,
              showTickLabels: true,
            },
            scale: {
              xAxisPosition: 'bottom',
            },
            fonts: {
              xAxisTickFontSize: 10,
              yAxisTickFontSize: 10,
              xAxisLabelFontSize: 16,
              yAxisLabelFontSize: 16,
              legendFontSize: 8,
              titleFontSize: 18,
              valueFontSize: 12,
              valueFontWeight: 100,
            },
            showLegend: false,
            showBaseline: true,
            baselineValue: 0,
            baselineWidth: 1,
            barBorderRadius: 4,
            valuePosition: 'outside',
          }}
          responsive={true}
        />

      </ChartContainer>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  );
}