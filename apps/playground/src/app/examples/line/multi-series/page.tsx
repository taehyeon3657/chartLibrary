'use client'

import { LineChart } from '@charts-library/react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateMultiSeriesData } from '@/utils/generateData'

export default function MultiSeriesExample() {
  const data = generateMultiSeriesData(30, ['Revenue', 'Profit', 'Expenses'])

  const code = `import { LineChart } from '@charts-library/react'

const data = [
  { date: new Date('2024-01-01'), value: 100, group: 'Revenue' },
  { date: new Date('2024-01-01'), value: 80, group: 'Profit' },
  { date: new Date('2024-01-01'), value: 20, group: 'Expenses' },
  // ...
]

function MyChart() {
  return (
    <LineChart 
      data={data}
      config={{
        width: 800,
        height: 400,
        showLegend: true,
        legendPosition: 'top',
        lineWidth: 2,
        showDots: true,
        dotRadius: 4
      }}
    />
  )
}`

  return (
    <ExampleLayout
      title="Multi-Series Line Chart"
      description="Display multiple data series in a single chart"
    >
      <ChartContainer>
        <LineChart 
          data={data}
          config={{
            width: 800,
            height: 400,
            showLegend: true,
            legendPosition: 'top',
            lineWidth: 2,
            showDots: true,
            dotRadius: 4
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