import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowRightIcon,
  BarChart3Icon,
  ListChecksIcon,
  PlusIcon,
  RadioIcon,
  UsersIcon,
} from 'lucide-react';
import { AppNav } from '../components/layout/AppNav';
import { PollCard } from '../components/poll/PollCard';
import { ClosePollModal } from '../components/poll/ClosePollModal';
import { DeletePollModal } from '../components/poll/DeletePollModal';
import { LiveResultsPanel } from '../components/poll/LiveResultsPanel';
import { Card } from '../components/ui/Card';
import { StatsCard } from '../components/ui/StatsCard';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterSelect } from '../components/ui/FilterSelect';
import { EmptyState } from '../components/ui/EmptyState';
import { ConnectionStatus } from '../components/ui/ConnectionStatus';
import { buttonClasses } from '../components/ui/Button';
import {
  PollCardSkeleton,
  Skeleton,
  StatsSkeleton,
} from '../components/ui/LoadingSkeleton';
import { usePolls } from '../contexts/PollsContext';
import { useAuth } from '../contexts/AuthContext';
import { useLiveFeed } from '../hooks/useLiveFeed';
import { useDelayedReady } from '../hooks/useDelayedReady';
import { pluralize, totalVotes } from '../utils/poll';

export function Dashboard() {
  const { user } = useAuth();
  const { polls, pollsLoading, closePoll, deletePoll, lastEvents } = usePolls();
  // useDelayedReady adds a short artificial delay so skeleton states feel
  // intentional rather than flashing for 50 ms on fast connections.
  const ready = useDelayedReady(pollsLoading);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [pollToClose, setPollToClose] = useState(null);
  const [pollToDelete, setPollToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Derived stats from real data
  const stats = useMemo(() => {
    const active = polls.filter((p) => p.status === 'active');
    const allVotes = polls.reduce((sum, p) => sum + totalVotes(p.options), 0);
    return {
      totalPolls: polls.length,
      totalVotes: allVotes,
      activePolls: active.length,
    };
  }, [polls]);

  const spotlight = useMemo(
    () =>
      polls
        .filter((p) => p.status === 'active')
        .sort((a, b) => totalVotes(b.options) - totalVotes(a.options))[0],
    [polls]
  );

  useLiveFeed(spotlight?.id, Boolean(spotlight));

  const visiblePolls = useMemo(
    () =>
      polls.filter((p) => {
        const matchesFilter = filter === 'all' || p.status === filter;
        const matchesQuery = p.question
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [polls, filter, query]
  );

  const spotlightEvent = spotlight ? lastEvents[spotlight.id] : undefined;

  // Derive first name from the authenticated user's full name
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="flex min-h-full w-full flex-col bg-canvas">
      <AppNav />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-3xl">
              Good {greeting()}, {firstName} 👋
            </h1>
            <p className="mt-2 text-[15px] text-ink-muted">
              Create a poll and start collecting responses.
            </p>
          </div>
          <Link to="/create" className={buttonClasses('primary', 'lg', 'shrink-0')}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Create New Poll
          </Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {/* Live spotlight */}
          <section aria-labelledby="live-now" className="lg:col-span-2">
            {!ready ? (
              <Card className="h-full">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-4 h-6 w-2/3" />
                <div className="mt-6 space-y-4">
                  <Skeleton className="h-2.5 w-full rounded-full" />
                  <Skeleton className="h-2.5 w-full rounded-full" />
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              </Card>
            ) : spotlight ? (
              <Card className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-3">
                  <h2
                    id="live-now"
                    className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle"
                  >
                    <RadioIcon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    Live now
                  </h2>
                  <ConnectionStatus size="sm" note="" />
                </div>

                <h3 className="mt-4 text-xl font-extrabold leading-snug tracking-tight text-ink sm:text-2xl">
                  {spotlight.question}
                </h3>
                <p className="mt-2 text-sm text-ink-muted tabular-nums">
                  {pluralize(totalVotes(spotlight.options), 'vote')} · updating automatically
                </p>

                <div className="mt-6">
                  <LiveResultsPanel
                    options={spotlight.options}
                    updatedOptionId={spotlightEvent?.optionId ?? null}
                    updateKey={spotlightEvent?.at ?? 0}
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
                  <Link
                    to={`/polls/${spotlight.id}/results`}
                    className={buttonClasses('primary', 'sm')}
                  >
                    Open live results
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to={`/polls/${spotlight.id}`}
                    className={buttonClasses('secondary', 'sm')}
                  >
                    Manage poll
                  </Link>
                </div>
              </Card>
            ) : (
              <EmptyState
                icon={<RadioIcon className="h-5 w-5" aria-hidden="true" />}
                title="No active polls"
                description="Open a poll for voting and its live results will appear here."
                action={
                  <Link to="/create" className={buttonClasses('primary', 'md')}>
                    Create Poll
                  </Link>
                }
              />
            )}
          </section>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {!ready ? (
              <div className="sm:col-span-3 lg:col-span-1">
                <StatsSkeleton />
              </div>
            ) : (
              <>
                <StatsCard
                  label="Total polls"
                  value={String(stats.totalPolls)}
                  icon={<ListChecksIcon className="h-4 w-4" aria-hidden="true" />}
                />
                <StatsCard
                  label="Total votes"
                  value={String(stats.totalVotes)}
                  icon={<UsersIcon className="h-4 w-4" aria-hidden="true" />}
                />
                <StatsCard
                  label="Active polls"
                  value={String(stats.activePolls)}
                  icon={<BarChart3Icon className="h-4 w-4" aria-hidden="true" />}
                  footnote="Accepting votes right now"
                />
              </>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <section aria-labelledby="recent-activity" className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="recent-activity"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle"
            >
              Recent activity
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchBar value={query} onChange={setQuery} className="sm:w-64" />
              <FilterSelect value={filter} onChange={setFilter} />
            </div>
          </div>

          {!ready ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <PollCardSkeleton />
              <PollCardSkeleton />
            </div>
          ) : visiblePolls.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon={<ListChecksIcon className="h-5 w-5" aria-hidden="true" />}
                title="No polls yet"
                description="Create your first poll to start collecting votes."
                action={
                  <Link to="/create" className={buttonClasses('primary', 'md')}>
                    Create Poll
                  </Link>
                }
              />
            </div>
          ) : (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {visiblePolls.slice(0, 4).map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onClose={setPollToClose}
                  onDelete={setPollToDelete}
                />
              ))}
            </ul>
          )}

          {ready && visiblePolls.length > 4 ? (
            <Link
              to="/polls"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all polls
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
        </section>
      </main>

      <ClosePollModal
        open={Boolean(pollToClose)}
        question={pollToClose?.question}
        onCancel={() => setPollToClose(null)}
        onConfirm={async () => {
          if (pollToClose) {
            try {
              await closePoll(pollToClose.id);
            } catch {
              // error already visible via toast in PollCard
            }
          }
          setPollToClose(null);
        }}
      />

      <DeletePollModal
        open={Boolean(pollToDelete)}
        question={pollToDelete?.question}
        loading={deleting}
        onCancel={() => setPollToDelete(null)}
        onConfirm={async () => {
          if (!pollToDelete) return;
          setDeleting(true);
          try {
            await deletePoll(pollToDelete.id);
            toast.success('Poll deleted.');
            setPollToDelete(null);
          } catch (err) {
            toast.error(err.message || 'Could not delete poll.');
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
