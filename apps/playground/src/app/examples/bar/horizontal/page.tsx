'use client'

import { BarChart } from '@charts-library/react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateBarChartData } from '@/utils/generateData'

export default function HorizontalExample() {
  const categories = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
  const data = generateBarChartData(categories, 100, 25)

  const code = `import { BarChart } from '@charts-library/react'

<BarChart
  data={data}
  config={{
    width: 800,
    height: 400,
    orientation: 'horizontal',
    barColors: ['#8b5cf6'],
    showValues: true,
    valuePosition: 'outside'
  }}
/>`

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
            width: 800,
            height: 400,
            orientation: 'horizontal',
            barColors: ['#8b5cf6'],
            showValues: true,
            valuePosition: 'outside'
          }}
        />
      </ChartContainer>

      <ChartContainer title="With Custom Colors">
        <BarChart
          data={data}
          config={{
            width: 800,
            height: 400,
            orientation: 'horizontal',
            barColors: ['#06b6d4'],
            showValues: true,
            valuePosition: 'middle',
            valueColor: 'white',
            barBorderRadius: 4
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