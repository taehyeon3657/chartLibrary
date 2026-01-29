'use client';

import React from 'react';
import { LineChart } from '@beaubrain/chart-lib-react';
import { ExampleLayout } from '@/components/ExampleLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { CodeBlock } from '@/components/CodeBlock';
import { generateMultiSeriesData } from '@/utils/generateData';

export default function CustomExample() {
  const data = generateMultiSeriesData(30, ['Sales', 'Target']);

  const code = `import { LineChart } from '@beaubrain/chart-lib-react'

<LineChart
  data={data}
  config={{
    width: 800,
    height: 500,
    responsive={true}

    // Title styling
    title: 'Monthly Sales Performance',
    titlePosition: 'LEFT',
    titleStyle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1f2937'
    },

    // Lines
    lineColors: ['#8b5cf6', '#06b6d4'],
    lineWidth: 3,

    // Dots
    showDots: true,
    dotRadius: 6,

    // Area
    showAreaFill: true,
    areaFillOpacity: 0.15,

    // Axes
    showXAxis: true,
    showYAxis: true,
    xAxisLabel: 'Time Period',
    yAxisLabel: 'Sales ($)',
    gridLines: true,
    gridColor: '#e5e7eb',
    axisColor: '#9ca3af',

    // Legend
    showLegend: true,
    legendPosition: 'top',

    // Animation
    enableAnimation: true,
    animationDuration: 1200
  }}
/>`;

  return (
    <ExampleLayout
      type="line"
      title="Custom Styled Chart"
      description="Heavily customized chart with various styling options"
    >
      <ChartContainer>

        <LineChart
          data={data}
          responsive={true}
          config={{
            width: 800,
            height: 500,


            fonts: {
              xAxisTickFontSize: 6,
              yAxisTickFontSize: 6,
              xAxisLabelFontSize: 16,
              yAxisLabelFontSize: 16,
              legendFontSize: 8,
              titleFontSize: 18,
              valueFontSize: 8,
            },
            lineColors: ['#8b5cf6', '#06b6d4'],
            lineWidth: 1,
            showDots: true,
            dotRadius: 3,
            showAreaFill: true,
            areaFillOpacity: 0.15,
            showXAxis: true,
            showYAxis: true,
            gridLines: false,
            xAxisLabel: 'Time Period',
            yAxisLabel: 'Sales ($)',
            gridColor: '#e5e7eb',
            axisColor: '#9ca3af',
            enableAnimation: false,
            animationDuration: 1200,
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