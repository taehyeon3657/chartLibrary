'use client'

import { BarChart } from '@beaubrain/react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateBarChartData } from '@/utils/generateData'

export default function BasicExample() {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const data = generateBarChartData(categories, 100, 30)

  console.log('data: ', data)

  const code = `import { BarChart } from '@beaubrain/react'

const data = [
  { x: 'Jan', value: 100, date: new Date() },
  { x: 'Feb', value: 120, date: new Date() },
  { x: 'Mar', value: 115, date: new Date() },
  // ...
]

function MyChart() {
  return (
    <BarChart
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
      type="bar"
      title="Basic Bar Chart"
      description="A simple bar chart with default settings"
    >
      <ChartContainer title="Chart">
        <div className='flex justify-center items-center h-full'>
          <BarChart
            data={data}
            config={{
              width: 800,
              height: 400,
              margin: { top: 20, right: 20, bottom: 40, left: 60 },
              xAxisLabelPosition: 'center'
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