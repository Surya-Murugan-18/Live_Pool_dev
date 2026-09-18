import React from 'react';
import { Card } from './Card';
export function StatsCard({ label, value, icon, footnote }) {
    return (<Card className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{label}</p>
        <p className="mt-2 text-3xl font-extrabold tracking-tight text-ink tabular-nums">{value}</p>
        {footnote ? <p className="mt-1 text-xs text-ink-muted">{footnote}</p> : null}
      </div>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
    </Card>);
}
