import React from 'react';
import { twMerge } from 'tailwind-merge';
/** Wordmark + circular vote-activity mark. */
export function Logo({ className, compact = false }) {
    return (<span className={twMerge('inline-flex items-center gap-2.5', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.5"/>
          <path d="M8 14.5V11M12 14.5V8M16 14.5v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </span>
      {compact ? null :
            <span className="text-[17px] font-extrabold tracking-tight text-ink">
          LIVE<span className="text-brand-600">POLL</span>
        </span>}
    </span>);
}
