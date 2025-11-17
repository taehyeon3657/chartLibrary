'use client'

import { LineChart } from '@beaubrain/chart-lib-react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateTimeSeriesData } from '@/utils/generateData'

export default function CurvesExample() {
  const data = generateTimeSeriesData(15, 100, 15)

  const curveTypes = [
    { type: 'linear', label: 'Linear' },
    { type: 'monotoneX', label: 'Monotone X' },
    { type: 'natural', label: 'Natural' },
    { type: 'step', label: 'Step' },
    { type: 'stepBefore', label: 'Step Before' },
    { type: 'stepAfter', label: 'Step After' },
  ]

  const code = `import { LineChart } from '@beaubrain/chart-lib-react'

// Different curve types
<LineChart
  data={data}
  config={{
    enableCurve: true,
    curveType: 'monotoneX' // 'linear' | 'monotoneX' | 'natural' | 'step'
  }}
/>`

  return (
    <ExampleLayout
      type="line"
      title="Curve Interpolation Types"
      description="Different line interpolation methods"
    >
      <div className="grid grid-cols-2 gap-4">
        {curveTypes.map(({ type, label }) => (
          <ChartContainer key={type} title={label}>
            <LineChart
              data={data}
              config={{
                width: 380,
                height: 250,
                enableCurve: true,
                curveType: type as any,
                showDots: true,
                dotRadius: 4,
                lineWidth: 2
              }}
            />
          </ChartContainer>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  )
}