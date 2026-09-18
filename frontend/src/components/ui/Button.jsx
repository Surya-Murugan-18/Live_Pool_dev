import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2Icon } from 'lucide-react';
const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-swift disabled:cursor-not-allowed disabled:opacity-55 active:translate-y-px';
const variants = {
    primary: 'bg-brand-600 text-white shadow-card hover:bg-brand-700',
    secondary: 'bg-white text-ink border border-line-strong shadow-card hover:bg-brand-50 hover:border-brand-200',
    ghost: 'bg-transparent text-ink-muted hover:bg-white hover:text-ink',
    danger: 'bg-white text-danger-600 border border-danger-100 hover:bg-danger-50'
};
const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
};
export function buttonClasses(variant = 'primary', size = 'md', extra = '') {
    return twMerge(base, variants[variant], sizes[size], extra);
}
export function Button({ variant = 'primary', size = 'md', loading = false, loadingLabel, fullWidth = false, className, children, disabled, ...rest }) {
    return (<button type="button" {...rest} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClasses(variant, size, twMerge(fullWidth ? 'w-full' : '', className))}>
      
      {loading ?
            <>
          <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true"/>
          <span>{loadingLabel ?? 'Working…'}</span>
        </> :
            children}
    </button>);
}
