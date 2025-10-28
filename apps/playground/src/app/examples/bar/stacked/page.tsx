'use client'

import { BarChart } from '@charts-library/react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateStackedBarData } from '@/utils/generateData'

export default function StackedExample() {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const series = ['Desktop', 'Mobile', 'Tablet']
  const data = generateStackedBarData(categories, series)

  const code = `import { BarChart } from '@charts-library/react'

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
/>`

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
            width: 800,
            height: 400,
            stacked: true,
            showLegend: true,
            legendPosition: 'top',
            barBorderRadius: 4
          }}
        />
      </ChartContainer>

      <ChartContainer title="Stacked Bars - Horizontal">
        <BarChart
          data={data}
          config={{
            width: 800,
            height: 400,
            orientation: 'horizontal',
            stacked: true,
            showLegend: true,
            legendPosition: 'top',
            barBorderRadius: 4,
            barColors: ['#3b82f6', '#10b981', '#f59e0b']
          }}
        />
      </ChartContainer>

      <ChartContainer title="Stacked Bars with Values">
        <BarChart
          data={data}
          config={{
            width: 800,
            height: 400,
            stacked: true,
            showLegend: true,
            legendPosition: 'top',
            showValues: true,
            valuePosition: 'middle',
            valueColor: 'white',
            valueFontSize: 10
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