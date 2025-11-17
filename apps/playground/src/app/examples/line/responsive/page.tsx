'use client'

import { LineChart } from '@beaubrain/chart-lib-react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateTimeSeriesData } from '@/utils/generateData'

export default function ResponsiveExample() {
  const data = generateTimeSeriesData(30)

  const code = `import { LineChart } from '@beaubrain/chart-lib-react'

// Chart will automatically resize with container
<LineChart
  data={data}
  responsive={true}
  config={{
    showLegend: true,
    lineWidth: 2
  }}
/>`

  return (
    <ExampleLayout
      type="line"
      title="Responsive Charts"
      description="Charts that automatically adapt to container size"
    >
      <ChartContainer title="Responsive Chart - Try resizing your browser">
        <div style={{ width: '100%', height: '400px' }}>
          <LineChart
            data={data}
            responsive={true}
            config={{
              showLegend: true,
              lineWidth: 2
            }}
          />
        </div>
      </ChartContainer>

      <div className="grid grid-cols-2 gap-4">
        <ChartContainer title="Small Container">
          <div style={{ width: '100%', height: '200px' }}>
            <LineChart
              data={data}
              responsive={true}
            />
          </div>
        </ChartContainer>

        <ChartContainer title="Small Container">
          <div style={{ width: '100%', height: '200px' }}>
            <LineChart
              data={data}
              responsive={true}
            />
          </div>
        </ChartContainer>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  )
}