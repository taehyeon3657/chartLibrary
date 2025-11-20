'use client';

import React from 'react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ExampleLayoutProps {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area'
  title: string
  description: string
  children: ReactNode
}

export function ExampleLayout({ type, title, description, children }: ExampleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href={`/examples/${type}`} className="text-blue-600 hover:text-blue-800">
            ← Back to Examples
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#3B82F6]">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        {children}
      </main>
    </div>
  );
}