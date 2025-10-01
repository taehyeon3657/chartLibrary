'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface ExampleLayoutProps {
  title: string
  description: string
  children: ReactNode
}

export function ExampleLayout({ title, description, children }: ExampleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Examples
          </Link>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[#3B82F6]">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        
        {children}
      </main>
    </div>
  )
}