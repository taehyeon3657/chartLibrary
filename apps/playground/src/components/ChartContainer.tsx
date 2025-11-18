'use client';

import React from 'react';
import { ReactNode } from 'react';

interface ChartContainerProps {
  title?: string
  children: ReactNode
}

export function ChartContainer({ title, children }: ChartContainerProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 font-mono">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  );
}