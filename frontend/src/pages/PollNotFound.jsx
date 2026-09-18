import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircleIcon } from 'lucide-react';
import { PublicNav } from '../components/layout/PublicNav';
import { buttonClasses } from '../components/ui/Button';
export function PollNotFound() {
    return (<div className="flex min-h-full w-full flex-col bg-canvas">
      <PublicNav status="closed"/>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white text-ink-subtle shadow-card">
          <HelpCircleIcon className="h-7 w-7" aria-hidden="true"/>
        </span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Poll Not Found</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          This poll may have been deleted or the link may be incorrect.
        </p>
        <Link to="/" className={buttonClasses('primary', 'lg', 'mt-8')}>
          Go to LivePoll
        </Link>
      </main>
    </div>);
}
