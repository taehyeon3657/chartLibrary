'use client';

import React from 'react';
import { BarChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
import { generateMultiSeriesBarData } from '@/utils/generateData';

export default function CustomExample() {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const series = ['Sales', 'Target'];
  const data = generateMultiSeriesBarData(categories, series, 100, 20);

  const code = `import { BarChart } from '@beaubrain/chart-lib-react'

<BarChart
  data={data}
  config={{
    width: 800,
    height: 500,
    responsive: true,

    // Title styling
    title: 'Monthly Sales Performance',
    titlePosition: 'LEFT',

    // Bars
    grouped: true,
    barColors: ['#8b5cf6', '#06b6d4'],
    barBorderRadius: 6,
    barPadding: 0.2,

    // Values
    showValues: true,
    valuePosition: 'top',
    valueFontSize: 11,

    // Axes
    showXAxis: true,
    showYAxis: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Amount ($)',
    gridLines: true,
    horizontalGridLines: true,
    verticalGridLines: false,
    gridColor: '#e5e7eb',
    axisColor: '#9ca3af',

    // Legend
    showLegend: true,
    legendPosition: 'top',

    // Animation
    enableAnimation: true,
    animationDuration: 1000
  }}
/>`;

  return (
    <ExampleLayout
      type="bar"
      title="Custom Styled Chart"
      description="Heavily customized chart with various styling options"
    >
      <ChartContainer>
        <BarChart
          data={data}
          config={{
            width: 800,
            height: 400,
            responsive: true,
            grouped: true,
            xAxisLabelPosition: 'center',
            barColors: ['#8b5cf6', '#06b6d4'],
            barWidth: 20,
            barBorderRadius: 6,
            barPadding: 0.2,
            showValues: true,
            valuePosition: 'top',
            fonts: {
              xAxisTickFontSize: 6,
              yAxisTickFontSize: 6,
              xAxisLabelFontSize: 16,
              yAxisLabelFontSize: 16,
              legendFontSize: 8,
              titleFontSize: 18,
              valueFontSize: 8,
            },
            showXAxis: true,
            showYAxis: true,
            gridLines: true,
            horizontalGridLines: true,
            verticalGridLines: false,
            gridColor: '#e5e7eb',
            axisColor: '#9ca3af',
            enableAnimation: false,
            margin: { top: 60, right: 20, bottom: 60, left: 80 }
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