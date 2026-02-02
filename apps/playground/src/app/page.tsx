import React from 'react';
import Link from 'next/link';
import { BarChart3, LineChart as LineChartIcon, TrendingUp } from 'lucide-react';

export default function Home() {
  const chartTypes = [
    {
      title: 'Line Charts',
      description: 'Visualize trends and patterns over time with smooth, elegant line charts',
      icon: LineChartIcon,
      href: '/examples/line',
      gradient: 'from-blue-500 to-cyan-500',
      examples: 12
    },
    {
      title: 'Bar Charts',
      description: 'Compare categories and values with powerful, customizable bar charts',
      icon: BarChart3,
      href: '/examples/bar',
      gradient: 'from-purple-500 to-pink-500',
      examples: 10
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:20px_20px]" />

        <div className="relative max-w-7xl mx-auto px-8 py-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-slate-200">
              <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-slate-700">Professional Chart Library</span>
            </div>

            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
              Chart Library
              <span className="block text-4xl mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                Playground
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Explore interactive examples showcasing powerful data visualization components
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 pb-24">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl -z-10" />
          <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-800">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Design System</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Component Documentation
                </h2>
                <p className="text-slate-400 max-w-xl text-lg">
                  Browse our comprehensive Storybook to explore atomic components,
                  their properties, and visual states in isolation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link
                  href="/storybook-static/index.html"
                  target="_blank"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1"
                >
                  <span className="mr-2">🎨</span>
                  Open Storybook
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>

                <div className="hidden lg:flex items-center gap-3 px-6 py-4 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-400 text-sm">
                  <code className="text-indigo-400">v1.0.2</code>
                  <span className="w-1 h-1 bg-slate-600 rounded-full" />
                  <span>React + D3.js</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {chartTypes.map((chartType) => {
            const Icon = chartType.icon;
            return (
              <Link
                key={chartType.href}
                href={chartType.href}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10 ${chartType.gradient}`}
                  style={{
                    backgroundImage: 'linear-gradient(to right, var(--tw-gradient-stops))',
                  }} />

                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200
                              group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${chartType.gradient} shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">{chartType.examples}</div>
                      <div className="text-sm text-slate-500">Examples</div>
                    </div>
                  </div>

                  <h2 className={`text-3xl font-bold text-slate-900 mb-3 group-hover:bg-clip-text
                               group-hover:bg-gradient-to-r transition-all duration-300 group-hover:${chartType.gradient}`}>
                    {chartType.title}
                  </h2>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {chartType.description}
                  </p>

                  <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Explore Examples</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 pb-24">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border border-slate-200 shadow-xl">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Key Features</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Responsive Design', icon: '📱' },
              { label: 'Custom Themes', icon: '🎨' },
              { label: 'Interactive', icon: '✨' },
              { label: 'TypeScript', icon: '📘' },
            ].map((feature) => (
              <div key={feature.label} className="text-center p-4 rounded-xl hover:bg-white/80 transition-colors">
                <div className="text-4xl mb-2">{feature.icon}</div>
                <div className="text-sm font-medium text-slate-700">{feature.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}