'use client'

import { useState } from 'react'
import { BarChart } from '@beaubrain/chart-lib-react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { generateMultiSeriesBarData } from '@/utils/generateData'

export default function InteractiveExample() {
  const categories = ['Q1', 'Q2', 'Q3', 'Q4']
  const series = ['Product A', 'Product B', 'Product C']
  const data = generateMultiSeriesBarData(categories, series, 100, 20)
  const [events, setEvents] = useState<string[]>([])

  const addEvent = (eventName: string, data: any) => {
    const eventLog = `${eventName}: ${data.group || 'N/A'} - Value: ${data.value?.toFixed(2) || 'N/A'}`
    setEvents(prev => [eventLog, ...prev.slice(0, 9)])
  }

  const code = `import { BarChart } from '@beaubrain/chart-lib-react'

<BarChart
  data={data}
  config={{
    width: 800,
    height: 400,
    grouped: true,
    showLegend: true
  }}
  onChartClick={(e) => console.log('Clicked:', e)}
  onChartHover={(e) => console.log('Hovering:', e)}
  onChartMouseenter={(e) => console.log('Mouse enter:', e)}
  onChartMouseleave={(e) => console.log('Mouse leave:', e)}
  onLegendToggle={(e) => console.log('Legend toggle:', e)}
/>`

  return (
    <ExampleLayout
      type="bar"
      title="Interactive Events"
      description="Charts with click, hover, and other interaction events"
    >
      <ChartContainer title="Hover and Click on Bars">
        <BarChart
          data={data}
          config={{
            width: 800,
            height: 400,
            grouped: true,
            showLegend: true,
            showTooltip: true
          }}
          onChartClick={(e) => addEvent('Click', e.data)}
          onChartHover={(e) => addEvent('Hover', e.data)}
          onChartMouseenter={(e) => addEvent('Mouse Enter', e.data)}
          onChartMouseleave={(e) => addEvent('Mouse Leave', e.data)}
          onLegendToggle={(e) => addEvent('Legend Toggle', { group: e.group, visible: e.visible })}
        />
      </ChartContainer>

      <ChartContainer title="Event Log (Last 10 Events)">
        <div className="bg-gray-500 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
          {events.length === 0 ? (
            <p className="text-gray-500">Interact with the chart to see events...</p>
          ) : (
            events.map((event, idx) => (
              <div key={idx} className="mb-1">{event}</div>
            ))
          )}
        </div>
      </ChartContainer>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Code Example</h3>
        <CodeBlock code={code} />
      </div>
    </ExampleLayout>
  )
}