import React from 'react';
import { twMerge } from 'tailwind-merge';
export function Avatar({ initials, name, size = 'md', className }) {
    return (<span aria-hidden="true" title={name} className={twMerge('inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700', size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-xs', className)}>
      
      {initials}
    </span>);
}
