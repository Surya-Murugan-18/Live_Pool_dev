import React from 'react';
import { twMerge } from 'tailwind-merge';
import { CrownIcon } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
export function ResultBar({ label, votes, percent, leading = false, dimmed = false, flashKey = 0, emphasis = 'default', className }) {
    const compact = emphasis === 'compact';
    return (<div className={twMerge('relative -mx-2 rounded-lg px-2 py-2', className)}>
      {flashKey ?
            <span key={flashKey} aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-lg animate-flash-row"/> :
            null}
      <div className="relative mb-2 flex items-baseline justify-between gap-3">
        <span className={twMerge('flex min-w-0 items-center gap-1.5 font-semibold text-ink', compact ? 'text-sm' : 'text-[15px]')}>
          
          <span className="truncate">{label}</span>
          {leading && !dimmed ?
            <CrownIcon className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-label="Leading option"/> :
            null}
        </span>
        <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
          {!compact ? <span className="text-xs text-ink-muted">{votes} votes</span> : null}
          <span key={percent} className={twMerge('font-bold text-ink animate-count-bump', compact ? 'text-sm' : 'text-base')}>
            
            {percent}%
          </span>
        </span>
      </div>
      <div className="relative">
        <ProgressBar value={percent} label={`${label}: ${percent} percent, ${votes} votes`} tone={dimmed ? 'neutral' : 'brand'} size={compact ? 'sm' : 'md'}/>
        
      </div>
      {compact ? <p className="mt-1.5 text-xs text-ink-muted tabular-nums">{votes} votes</p> : null}
    </div>);
}
