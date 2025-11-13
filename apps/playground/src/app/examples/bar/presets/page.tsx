'use client'

import { BarChart } from '@beaubrain/react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateBarChartData } from '@/utils/generateData'

export default function PresetsExample() {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const data = generateBarChartData(categories, 100, 20)

  const code = `import { BarChart } from '@beaubrain/react'

// Minimal preset - Clean and simple
<BarChart data={data} preset="minimal" />

// Detailed preset - All features enabled
<BarChart data={data} preset="detailed" />

// Presentation preset - Bold and eye-catching
<BarChart data={data} preset="presentation" />

// Dashboard preset - Optimized for dashboards
<BarChart data={data} preset="dashboard" />`

  return (
    <ExampleLayout
      type="bar"
      title="Configuration Presets"
      description="Pre-configured chart styles for different use cases"
    >
      <ChartContainer title="Minimal Preset">
        <BarChart
          data={data}
          preset="minimal"
          config={{ width: 800, height: 250 }}
        />
      </ChartContainer>

      <ChartContainer title="Detailed Preset">
        <BarChart
          data={data}
          preset="detailed"
          config={{ width: 800, height: 250 }}
        />
      </ChartContainer>

      <ChartContainer title="Presentation Preset">
        <BarChart
          data={data}
          preset="presentation"
          config={{ width: 800, height: 250 }}
        />
      </ChartContainer>

      <ChartContainer title="Dashboard Preset">
        <BarChart
          data={data}
          preset="dashboard"
          config={{ width: 800, height: 250 }}
        />
      </ChartContainer>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  )
}