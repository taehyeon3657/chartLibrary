'use client'

import { useState, useEffect, useRef } from 'react'
import { LineChart, LineChartRef } from '@beaubrain/react'
import { ExampleLayout } from '@/components/ExampleLayout'
import { ChartContainer } from '@/components/ChartContainer'
import { CodeBlock } from '@/components/CodeBlock'
import { ChartDataPoint } from '@beaubrain/types'

export default function RealtimeExample() {
  const [data, setData] = useState<ChartDataPoint[]>(() => {
    const initial: ChartDataPoint[] = []
    const now = Date.now()
    for (let i = 0; i < 30; i++) {
      initial.push({
        date: new Date(now - (30 - i) * 1000),
        value: 50 + Math.random() * 50
      })
    }
    return initial
  })

  const [isRunning, setIsRunning] = useState(false)
  const chartRef = useRef<LineChartRef>(null)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData]
        const lastValue = newData[newData.length - 1].value || 50

        // Add new data point
        newData.push({
          date: new Date(),
          value: Math.max(0, lastValue + (Math.random() - 0.5) * 20)
        })

        // Keep only last 30 points
        if (newData.length > 30) {
          newData.shift()
        }

        return newData
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const code = `import { useState, useEffect } from 'react'
import { LineChart } from '@beaubrain/react'

function RealtimeChart() {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData]
        const lastValue = newData[newData.length - 1].value

        newData.push({
          date: new Date(),
          value: lastValue + (Math.random() - 0.5) * 20
        })

        // Keep sliding window of 30 points
        if (newData.length > 30) {
          newData.shift()
        }

        return newData
      })
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  return (
    <LineChart
      data={data}
      config={{
        enableAnimation: true,
        animationDuration: 500
      }}
    />
  )
}`

  return (
    <ExampleLayout
      type="line"
      title="Real-time Data Updates"
      description="Live updating charts with streaming data"
    >
      <ChartContainer>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded font-medium ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? 'Stop' : 'Start'} Live Updates
          </button>

          <button
            onClick={() => {
              setData(prevData => {
                const initial: ChartDataPoint[] = []
                const now = Date.now()
                for (let i = 0; i < 30; i++) {
                  initial.push({
                    date: new Date(now - (30 - i) * 1000),
                    value: 50 + Math.random() * 50
                  })
                }
                return initial
              })
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
          >
            Reset Data
          </button>
        </div>

        <div className="bg-gray-100 rounded p-2 mb-4">
          <span className="text-sm font-mono">
            Data Points: {data.length} |
            Status: <span className={isRunning ? 'text-green-600' : 'text-red-600'}>
              {isRunning ? '● LIVE' : '○ STOPPED'}
            </span>
          </span>
        </div>

        <LineChart
          ref={chartRef}
          data={data}
          config={{
            width: 800,
            height: 400,
            enableAnimation: true,
            animationDuration: 500,
            lineWidth: 2,
            showDots: true,
            dotRadius: 3,
            lineColors: ['#10b981']
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