import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeftIcon, SettingsIcon, UsersIcon } from 'lucide-react';
import { AppNav } from '../components/layout/AppNav';
import { LiveResultsPanel } from '../components/poll/LiveResultsPanel';
import { ConnectionStatus } from '../components/ui/ConnectionStatus';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ResultsSkeleton, Skeleton } from '../components/ui/LoadingSkeleton';
import { buttonClasses } from '../components/ui/Button';
import { PollNotFound } from './PollNotFound';
import { usePolls } from '../contexts/PollsContext';
import { useAppConfig } from '../contexts/AppConfigContext';
import { useLiveFeed } from '../hooks/useLiveFeed';
import { useTicker } from '../hooks/useTicker';
import { relativeTime, totalVotes } from '../utils/poll';

export function LiveResults() {
  const { pollId } = useParams();
  const { getPoll, ensurePoll, lastEvents } = usePolls();
  const { connectionState } = useAppConfig();

  const [fetchState, setFetchState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    setFetchState('loading');
    ensurePoll(pollId).then((poll) => {
      if (cancelled) return;
      setFetchState(poll ? 'found' : 'notfound');
    });
    return () => {
      cancelled = true;
    };
  }, [pollId, ensurePoll]);

  const poll = getPoll(pollId);
  const event = poll ? lastEvents[poll.id] : undefined;
  const now = useTicker(Boolean(event));
  const lastToastAt = useRef(0);

  useLiveFeed(poll?.id, fetchState === 'found' && Boolean(poll));

  useEffect(() => {
    if (!event) return;
    if (event.at - lastToastAt.current < 15000) return;
    lastToastAt.current = event.at;
    toast.success('New vote received');
  }, [event]);

  if (fetchState === 'loading') {
    return (
      <div className="flex min-h-full w-full flex-col bg-canvas">
        <AppNav />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
          <Skeleton className="h-8 w-64" />
          <div className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
            <Skeleton className="h-16 w-32" />
            <div className="mt-7">
              <ResultsSkeleton rows={3} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (fetchState === 'notfound' || !poll) {
    return <PollNotFound />;
  }

  const total = totalVotes(poll.options);
  const isActive = poll.status === 'active';

  return (
    <div className="flex min-h-full w-full flex-col bg-canvas">
      <AppNav />

      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to={`/polls/${poll.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-swift hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Poll details
          </Link>
          {isActive ? <ConnectionStatus /> : <StatusBadge status="closed" />}
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            {isActive ? 'Live Results' : 'Final Results'}
          </p>
          <h1 className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[40px]">
            {poll.question}
          </h1>
        </header>

        <section className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Total votes
              </p>
              <p className="mt-1 flex items-baseline gap-2">
                <span
                  key={total}
                  className="text-[44px] font-extrabold leading-none tracking-tight text-ink tabular-nums animate-count-bump sm:text-[56px]"
                >
                  {total}
                </span>
                <span className="text-sm font-medium text-ink-muted">votes</span>
              </p>
            </div>

            <div className="flex h-10 items-center gap-3">
              <AnimatePresence>
                {event && isActive ? (
                  <motion.span
                    key={event.at}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-full border border-live-100 bg-live-50 px-3 py-1.5 text-xs font-bold text-live-700"
                  >
                    +1 vote
                  </motion.span>
                ) : null}
              </AnimatePresence>
              <p className="text-xs text-ink-subtle" aria-live="polite">
                {event ? `Updated ${relativeTime(event.at, now)}` : 'Waiting for the next vote…'}
              </p>
            </div>
          </div>

          <div className="mt-7">
            <LiveResultsPanel
              options={poll.options}
              dimmed={!isActive}
              updatedOptionId={isActive ? event?.optionId ?? null : null}
              updateKey={event?.at ?? 0}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            {isActive ? (
              <ConnectionStatus size="sm" />
            ) : (
              <p className="text-sm font-medium text-ink-muted">
                Voting is no longer available.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link to={`/poll/${poll.id}`} className={buttonClasses('secondary', 'sm')}>
                <UsersIcon className="h-4 w-4" aria-hidden="true" />
                Audience view
              </Link>
              <Link to={`/polls/${poll.id}`} className={buttonClasses('secondary', 'sm')}>
                <SettingsIcon className="h-4 w-4" aria-hidden="true" />
                Manage
              </Link>
            </div>
          </div>
        </section>

        {connectionState === 'disconnected' ? (
          <p className="mt-4 text-center text-sm text-ink-muted">
            The numbers above are the last values we received. They will catch up as soon as the
            connection returns.
          </p>
        ) : null}
      </main>
    </div>
  );
}
