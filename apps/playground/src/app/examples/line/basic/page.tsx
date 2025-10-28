'use client'

import { LineChart } from '@charts-library/react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateTimeSeriesData } from '@/utils/generateData'

export default function BasicExample() {
  const data = generateTimeSeriesData(30, 100, 5)

  const code = `import { LineChart } from '@charts-library/react'

const data = [
  { date: new Date('2024-01-01'), value: 100 },
  { date: new Date('2024-01-02'), value: 120 },
  { date: new Date('2024-01-03'), value: 115 },
  // ...
]

function MyChart() {
  return (
    <LineChart
      data={data}
      config={{
        width: 800,
        height: 400,
        margin: { top: 20, right: 20, bottom: 40, left: 60 }
      }}
    />
  )
}`

  return (
    <ExampleLayout
      type="line"
      title="Basic Line Chart"
      description="A simple line chart with default settings"
    >
      <ChartContainer title="Chart">
        <div className='flex justify-center items-center h-full'>
        <LineChart
          data={data}
          config={{
            width: 800,
            height: 400,
            margin: { top: 20, right: 20, bottom: 40, left: 60 }
          }}
        />
          </div>
      </ChartContainer>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  )
}