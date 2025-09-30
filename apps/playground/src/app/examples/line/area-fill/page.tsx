'use client'

import { LineChart } from '@charts-library/react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateMultiSeriesData } from '@/utils/generateData'

export default function AreaFillExample() {
  const data = generateMultiSeriesData(30, ['Revenue', 'Costs'])

  const code = `import { LineChart } from '@charts-library/react'

<LineChart 
  data={data}
  config={{
    width: 800,
    height: 400,
    showAreaFill: true,
    areaFillOpacity: 0.2,
    areaGradient: true,
    showLegend: true,
    lineWidth: 2
  }}
/>`

  return (
    <ExampleLayout
      title="Area Fill Charts"
      description="Line charts with filled areas and gradient effects"
    >
      <ChartContainer title="Area Fill with Gradient">
        <LineChart 
          data={data}
          config={{
            width: 800,
            height: 400,
            showAreaFill: true,
            areaFillOpacity: 0.2,
            areaGradient: true,
            showLegend: true,
            lineWidth: 2
          }}
        />
      </ChartContainer>

      <ChartContainer title="Higher Opacity">
        <LineChart 
          data={data}
          config={{
            width: 800,
            height: 400,
            showAreaFill: true,
            areaFillOpacity: 0.4,
            showLegend: true,
            lineWidth: 2
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
