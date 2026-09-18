import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { LivePollPreview } from '../poll/LivePollPreview';
export function AuthLayout({ panelTitle, panelText, children }) {
    return (<div className="flex min-h-full w-full flex-col lg:flex-row">
      <aside className="flex flex-col justify-between gap-10 border-b border-line bg-white px-6 py-8 lg:w-[46%] lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
        <Link to="/" aria-label="LivePoll home">
          <Logo />
        </Link>
        <div className="max-w-md">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{panelTitle}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{panelText}</p>
          <div className="mt-8 hidden lg:block">
            <LivePollPreview compact/>
          </div>
        </div>
        <p className="hidden text-xs text-ink-subtle lg:block">Create. Share. Vote. Live.</p>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-canvas px-4 py-10 sm:px-6 lg:py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>);
}
