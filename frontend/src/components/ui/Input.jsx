import React from 'react';
import { twMerge } from 'tailwind-merge';
import { AlertCircleIcon } from 'lucide-react';
export const inputClasses = 'h-11 w-full rounded-lg border border-line-strong bg-white px-3.5 text-sm text-ink placeholder:text-ink-subtle transition-[border-color,box-shadow] duration-150 ease-swift hover:border-brand-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100';
export const inputErrorClasses = 'border-danger-500 focus:border-danger-500 focus:ring-danger-100';
export function Input({ label, error, hint, trailing, id, className, ...rest }) {
    const inputId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
    return (<div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input id={inputId} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={twMerge(inputClasses, error ? inputErrorClasses : '', trailing ? 'pr-11' : '', className)} {...rest}/>
        
        {trailing ? <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div> : null}
      </div>
      {error ?
            <p id={`${inputId}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger-600">
          <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true"/>
          {error}
        </p> :
            hint ?
                <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-subtle">
          {hint}
        </p> :
                null}
    </div>);
}
