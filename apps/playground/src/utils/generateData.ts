import { ChartDataPoint } from '@charts-library/types'

export function generateTimeSeriesData(
  days: number = 30,
  baseValue: number = 100,
  volatility: number = 10
): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - (days - i))

    const randomChange = (Math.random() - 0.5) * volatility
    baseValue += randomChange

    data.push({
      date,
      value: Math.max(0, baseValue),
    })
  }

  return data
}

export function generateMultiSeriesData(
  days: number = 30,
  series: string[] = ['Series A', 'Series B', 'Series C']
): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const now = new Date()

  series.forEach((seriesName, seriesIndex) => {
    let baseValue = 100 + seriesIndex * 20

    for (let i = 0; i < days; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - (days - i))

      const randomChange = (Math.random() - 0.5) * 10
      baseValue += randomChange

      data.push({
        date,
        value: Math.max(0, baseValue),
        group: seriesName,
      })
    }
  })

  return data
}

export function generateSeasonalData(months: number = 12): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const now = new Date()

  for (let i = 0; i < months; i++) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - (months - i))

    // Seasonal pattern (higher in summer, lower in winter)
    const month = date.getMonth()
    const seasonal = 50 * Math.sin((month / 12) * Math.PI * 2)
    const baseValue = 100 + seasonal + (Math.random() - 0.5) * 20

    data.push({
      date,
      value: baseValue,
    })
  }

  return data
}

export function generateBarChartData(
  categories: string[],
  baseValue: number = 100,
  volatility: number = 30
): ChartDataPoint[] {
  return categories.map(category => ({
    x: category,
    value: Math.max(0, baseValue + (Math.random() - 0.5) * volatility * 2),
  }))
}

export function generateMultiSeriesBarData(
  categories: string[],
  series: string[],
  baseValue: number = 100,
  volatility: number = 30
): ChartDataPoint[] {
  const data: ChartDataPoint[] = []

  series.forEach((seriesName, seriesIndex) => {
    const offset = seriesIndex * 20
    categories.forEach(category => {
      data.push({
        x: category,
        value: Math.max(0, baseValue + offset + (Math.random() - 0.5) * volatility * 2),
        group: seriesName,
      })
    })
  })

  return data
}

export function generateStackedBarData(
  categories: string[],
  series: string[]
): ChartDataPoint[] {
  const data: ChartDataPoint[] = []

  categories.forEach(category => {
    series.forEach(seriesName => {
      data.push({
        x: category,
        value: Math.floor(Math.random() * 50) + 20,
        group: seriesName,
        date: new Date().toDateString(),
      })
    })
  })

  return data
}