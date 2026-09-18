import React from 'react';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2Icon, LockIcon } from 'lucide-react';
export function StatusBadge({ status, className }) {
    const isActive = status === 'active';
    const Icon = isActive ? CheckCircle2Icon : LockIcon;
    return (<span className={twMerge('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold', isActive ? 'border-live-100 bg-live-50 text-live-700' : 'border-line-strong bg-canvas text-ink-muted', className)}>
      
      <Icon className="h-3.5 w-3.5" aria-hidden="true"/>
      {isActive ? 'Active' : 'Closed'}
    </span>);
}
