import React from 'react';
export function EmptyState({ icon, title, description, action }) {
    return (<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-white px-6 py-14 text-center">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        {icon}
      </span>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>);
}
