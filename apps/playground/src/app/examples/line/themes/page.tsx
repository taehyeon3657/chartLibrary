'use client'

import { LineChart } from '@beaubrain/chart-lib-react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateMultiSeriesData } from '@/utils/generateData'

export default function ThemesExample() {
  const data = generateMultiSeriesData(30, ['Series A', 'Series B', 'Series C'])

  const code = `import { LineChart } from '@beaubrain/chart-lib-react'

// Light theme
<LineChart data={data} theme="light" />

// Dark theme
<LineChart data={data} theme="dark" />

// Colorful theme
<LineChart data={data} theme="colorful" />`

  return (
    <ExampleLayout
      type="line"
      title="Theme Variations"
      description="Pre-built themes for different visual styles"
    >
      <ChartContainer title="Light Theme">
        <LineChart
          data={data}
          theme="light"
          config={{
            width: 800,
            height: 300,
            showLegend: true
          }}
        />
      </ChartContainer>

      <ChartContainer title="Dark Theme">
        <div className="bg-gray-900 p-4 rounded">
          <LineChart
            data={data}
            theme="dark"
            config={{
              width: 800,
              height: 300,
              showLegend: true
            }}
          />
        </div>
      </ChartContainer>

      <ChartContainer title="Colorful Theme">
        <LineChart
          data={data}
          theme="colorful"
          config={{
            width: 800,
            height: 300,
            showLegend: true
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