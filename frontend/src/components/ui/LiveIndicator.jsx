import React from 'react';
import { twMerge } from 'tailwind-merge';
export function LiveIndicator({ label = 'LIVE', note, size = 'md', className }) {
    return (<span className={twMerge('inline-flex items-center gap-2 rounded-full border border-live-100 bg-live-50 font-semibold tracking-wide text-live-700', size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs', className)}>
      
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span className="absolute inline-flex h-2 w-2 rounded-full bg-live-500 animate-live-ring"/>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-live-500"/>
      </span>
      {label}
      {note ? <span className="font-medium normal-case tracking-normal text-live-600">{note}</span> : null}
    </span>);
}
