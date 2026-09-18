import React from 'react';
import { twMerge } from 'tailwind-merge';
export function Card({ as = 'div', padded = true, className, children, ...rest }) {
    const Tag = as;
    return (<Tag className={twMerge('rounded-xl border border-line bg-white shadow-card', padded ? 'p-5 sm:p-6' : '', className)} {...rest}>
      
      {children}
    </Tag>);
}
