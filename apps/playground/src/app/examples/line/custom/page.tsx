'use client'

import { LineChart } from '@charts-library/react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateMultiSeriesData } from '@/utils/generateData'

export default function CustomExample() {
  const data = generateMultiSeriesData(30, ['Sales', 'Target'])

  const code = `import { LineChart } from '@charts-library/react'

<LineChart 
  data={data}
  config={{
    width: 800,
    height: 500,
    
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
/>`

  return (
    <ExampleLayout
      title="Custom Styled Chart"
      description="Heavily customized chart with various styling options"
    >
      <ChartContainer>
        <LineChart 
          data={data}
          config={{
            width: 800,
            height: 500,
            title: 'Monthly Sales Performance',
            titlePosition: 'LEFT',
            titleStyle: {
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1f2937'
            },
            lineColors: ['#8b5cf6', '#06b6d4'],
            lineWidth: 1,
            showDots: true,
            dotRadius: 6,
            showAreaFill: true,
            areaFillOpacity: 0.15,
            showXAxis: true,
            showYAxis: true,
            gridLines: false,
            xAxisLabel: 'Time Period',
            yAxisLabel: 'Sales ($)',
            gridColor: '#e5e7eb',
            axisColor: '#9ca3af',
            showLegend: true,
            legendPosition: 'right',
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
  )
}