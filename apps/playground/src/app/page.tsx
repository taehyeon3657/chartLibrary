import Link from 'next/link'

export default function Home() {
  const examples = [
    {
      title: 'Basic Line Chart',
      description: 'Simple line chart with default settings',
      href: '/examples/line/basic',
    },
    {
      title: 'Multi-Series',
      description: 'Chart with multiple data series',
      href: '/examples/line/multi-series',
    },
    {
      title: 'Themes',
      description: 'Different theme variations (light, dark, colorful)',
      href: '/examples/line/themes',
    },
    {
      title: 'Presets',
      description: 'Pre-configured chart styles',
      href: '/examples/line/presets',
    },
    {
      title: 'Responsive',
      description: 'Responsive charts that adapt to container size',
      href: '/examples/line/responsive',
    },
    {
      title: 'Animations',
      description: 'Charts with various animation effects',
      href: '/examples/line/animations',
    },
    {
      title: 'Interactive',
      description: 'Charts with hover, click, and selection events',
      href: '/examples/line/interactive',
    },
    {
      title: 'Area Fill',
      description: 'Line charts with filled areas and gradients',
      href: '/examples/line/area-fill',
    },
    {
      title: 'Curve Types',
      description: 'Different line interpolation curves',
      href: '/examples/line/curves',
    },
    {
      title: 'Custom Styling',
      description: 'Heavily customized chart appearance',
      href: '/examples/line/custom',
    },
    {
      title: 'Trend Extensions',
      description: 'Charts with trend line predictions',
      href: '/examples/line/trends',
    },
    {
      title: 'Real-time Data',
      description: 'Live updating charts',
      href: '/examples/line/realtime',
    },
  ]

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Chart Library Playground</h1>
        <p className="text-gray-600 mb-8">
          Interactive examples showcasing the LineChart component
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example) => (
            <Link
              key={example.href}
              href={example.href}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{example.title}</h2>
              <p className="text-gray-600 text-sm">{example.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}