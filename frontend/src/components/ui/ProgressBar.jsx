import React from 'react';
import { twMerge } from 'tailwind-merge';
export function ProgressBar({ value, label, tone = 'brand', size = 'md', className }) {
    return (<div role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className={twMerge('w-full overflow-hidden rounded-full bg-canvas ring-1 ring-inset ring-line', size === 'sm' ? 'h-1.5' : 'h-2.5', className)}>
      
      <div className={twMerge('h-full rounded-full transition-[width] duration-300 ease-swift', tone === 'brand' ? 'bg-brand-600' : 'bg-ink-subtle')} style={{ width: `${Math.min(100, Math.max(0, value))}%` }}/>
      
    </div>);
}
