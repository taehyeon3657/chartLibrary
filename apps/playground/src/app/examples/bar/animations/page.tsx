'use client'

import { useState } from 'react'
import { BarChart } from '@beaubrain/chart-lib-react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateBarChartData, generateStackedBarData } from '@/utils/generateData'

export default function AnimationsExample() {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const [data, setData] = useState(generateBarChartData(categories, 100, 25))

  const series = ['Series A', 'Series B', 'Series C']
  const [stackedData, setStackedData] = useState(generateStackedBarData(categories.slice(0, 4), series))

  const regenerateData = () => {
    setData(generateBarChartData(categories, 100, 30))
  }

  const regenerateStackedData = () => {
    setStackedData(generateStackedBarData(categories.slice(0, 4), series))
  }

  const code = `import { BarChart } from '@beaubrain/chart-lib-react'

<BarChart
  data={data}
  config={{
    width: 800,
    height: 400,
    enableAnimation: true,
    animationDuration: 800,
    showValues: true
  }}
/>`

  return (
    <ExampleLayout
      type="bar"
      title="Animated Charts"
      description="Charts with smooth animations and transitions"
    >
      <ChartContainer>
        <div className="mb-4">
          <button
            onClick={regenerateData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Regenerate Data (Watch Animation)
          </button>
        </div>

        <BarChart
          data={data}
          config={{
            width: 800,
            height: 400,
            enableAnimation: true,
            animationDuration: 800,
            showValues: true,
            valuePosition: 'top',
            barBorderRadius: 4
          }}
        />
      </ChartContainer>

      <ChartContainer title="Stacked Animation">
        <div className="mb-4">
          <button
            onClick={regenerateStackedData}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Regenerate Data
          </button>
        </div>

        <BarChart
          data={stackedData}
          config={{
            width: 800,
            height: 400,
            stacked: true,
            enableAnimation: true,
            animationDuration: 1000,
            showLegend: true,
            legendPosition: 'top'
          }}
        />
      </ChartContainer>

      <ChartContainer title="Horizontal Animation">
        <div className="mb-4">
          <button
            onClick={regenerateData}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Regenerate Data
          </button>
        </div>

        <BarChart
          data={data}
          config={{
            width: 800,
            height: 400,
            orientation: 'horizontal',
            enableAnimation: true,
            animationDuration: 800,
            showValues: true,
            valuePosition: 'outside',
            barBorderRadius: 4,
            barColors: ['#10b981']
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