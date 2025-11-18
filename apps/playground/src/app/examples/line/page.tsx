import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, TrendingUp, Palette, Zap, Eye, AreaChart, Waves, Sliders, LineChart as LineIcon, Activity, Play } from 'lucide-react';

export default function LineChartsPage() {
  const examples = [
    {
      title: 'Basic Line Chart',
      description: 'Simple line chart with default settings',
      href: '/examples/line/basic',
      icon: LineIcon,
      color: 'blue'
    },
    {
      title: 'Multi-Series',
      description: 'Chart with multiple data series',
      href: '/examples/line/multi-series',
      icon: Activity,
      color: 'purple'
    },
    {
      title: 'Themes',
      description: 'Different theme variations (light, dark, colorful)',
      href: '/examples/line/themes',
      icon: Palette,
      color: 'pink'
    },
    {
      title: 'Presets',
      description: 'Pre-configured chart styles',
      href: '/examples/line/presets',
      icon: Sliders,
      color: 'indigo'
    },
    {
      title: 'Responsive',
      description: 'Responsive charts that adapt to container size',
      href: '/examples/line/responsive',
      icon: Sparkles,
      color: 'cyan'
    },
    {
      title: 'Animations',
      description: 'Charts with various animation effects',
      href: '/examples/line/animations',
      icon: Zap,
      color: 'yellow'
    },
    {
      title: 'Interactive',
      description: 'Charts with hover, click, and selection events',
      href: '/examples/line/interactive',
      icon: Eye,
      color: 'green'
    },
    {
      title: 'Area Fill',
      description: 'Line charts with filled areas and gradients',
      href: '/examples/line/area-fill',
      icon: AreaChart,
      color: 'teal'
    },
    {
      title: 'Curve Types',
      description: 'Different line interpolation curves',
      href: '/examples/line/curves',
      icon: Waves,
      color: 'violet'
    },
    {
      title: 'Custom Styling',
      description: 'Heavily customized chart appearance',
      href: '/examples/line/custom',
      icon: Palette,
      color: 'rose'
    },
    {
      title: 'Trend Extensions',
      description: 'Charts with trend line predictions',
      href: '/examples/line/trends',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      title: 'Real-time Data',
      description: 'Live updating charts',
      href: '/examples/line/realtime',
      icon: Play,
      color: 'red'
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    pink: 'from-pink-500 to-rose-500',
    indigo: 'from-indigo-500 to-purple-500',
    cyan: 'from-cyan-500 to-blue-500',
    yellow: 'from-yellow-500 to-orange-500',
    green: 'from-green-500 to-emerald-500',
    teal: 'from-teal-500 to-cyan-500',
    violet: 'from-violet-500 to-purple-500',
    rose: 'from-rose-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    red: 'from-red-500 to-pink-500'
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </Link>

            <div className="text-right">
              <h1 className="text-2xl font-bold text-slate-900">Line Charts</h1>
              <p className="text-sm text-slate-500">{examples.length} Examples</p>
            </div>
          </div>
        </div>
      </div>

      {/* Examples Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example) => {
            const Icon = example.icon;
            const gradient = colorMap[example.color];

            return (
              <Link
                key={example.href}
                href={example.href}
                className="group"
              >
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200
                              hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} mb-4 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {example.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {example.description}
                  </p>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-semibold
                                group-hover:translate-x-2 transition-transform duration-300">
                    <span>View Example</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}