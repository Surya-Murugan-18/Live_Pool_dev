import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
const options = [
    { value: 'all', label: 'All polls' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' }
];
export function FilterSelect({ value, onChange }) {
    return (<div className="relative">
      <select aria-label="Filter polls by status" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-line-strong bg-white pl-3.5 pr-10 text-sm font-medium text-ink transition-[border-color,box-shadow] duration-150 ease-swift hover:border-brand-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 sm:w-[150px]">
        
        {options.map((option) => <option key={option.value} value={option.value}>
            {option.label}
          </option>)}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true"/>
      
    </div>);
}
