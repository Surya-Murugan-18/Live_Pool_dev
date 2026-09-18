import React from 'react';
import { LockIcon } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ConnectionStatus } from '../ui/ConnectionStatus';
/** Audience-facing header — deliberately has no creator navigation. */
export function PublicNav({ status = 'active' }) {
    return (<header className="border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        {status === 'active' ?
            <ConnectionStatus note="" size="sm"/> :
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
            <LockIcon className="h-3.5 w-3.5" aria-hidden="true"/>
            POLL CLOSED
          </span>}
      </div>
    </header>);
}
