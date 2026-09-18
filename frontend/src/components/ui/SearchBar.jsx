import React from 'react';
import { SearchIcon } from 'lucide-react';
import { inputClasses } from './Input';
import { twMerge } from 'tailwind-merge';
export function SearchBar({ value, onChange, placeholder = 'Search polls', className }) {
    return (<div className={twMerge('relative w-full', className)}>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true"/>
      
      <input type="search" value={value} aria-label={placeholder} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={twMerge(inputClasses, 'pl-10')}/>
      
    </div>);
}
