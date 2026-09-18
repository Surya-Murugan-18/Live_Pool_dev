import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecksIcon, PlusIcon, SearchXIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AppNav } from '../components/layout/AppNav';
import { PollCard } from '../components/poll/PollCard';
import { ClosePollModal } from '../components/poll/ClosePollModal';
import { DeletePollModal } from '../components/poll/DeletePollModal';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterSelect } from '../components/ui/FilterSelect';
import { EmptyState } from '../components/ui/EmptyState';
import { buttonClasses } from '../components/ui/Button';
import { PollCardSkeleton } from '../components/ui/LoadingSkeleton';
import { usePolls } from '../contexts/PollsContext';
import { useDelayedReady } from '../hooks/useDelayedReady';

export function MyPolls() {
  const { polls, pollsLoading, closePoll, deletePoll } = usePolls();
  const ready = useDelayedReady(pollsLoading);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [pollToClose, setPollToClose] = useState(null);
  const [pollToDelete, setPollToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const visiblePolls = useMemo(
    () =>
      polls.filter((poll) => {
        const matchesFilter = filter === 'all' || poll.status === filter;
        const matchesQuery = poll.question
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [polls, filter, query]
  );

  const hasFilters = query.trim().length > 0 || filter !== 'all';

  const handleDelete = async () => {
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
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-canvas">
      <AppNav />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-3xl">
              My Polls
            </h1>
            <p className="mt-2 text-[15px] text-ink-muted">
              Every poll you own, with live vote counts and share links.
            </p>
          </div>
          <Link to="/create" className={buttonClasses('primary', 'lg', 'shrink-0')}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Create New Poll
          </Link>
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBar value={query} onChange={setQuery} className="sm:max-w-sm" />
          <FilterSelect value={filter} onChange={setFilter} />
        </div>

        {!ready ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PollCardSkeleton />
            <PollCardSkeleton />
            <PollCardSkeleton />
          </div>
        ) : visiblePolls.length === 0 ? (
          <div className="mt-6">
            {hasFilters ? (
              <EmptyState
                icon={<SearchXIcon className="h-5 w-5" aria-hidden="true" />}
                title="No polls match your search"
                description="Try a different keyword or switch the status filter back to all polls."
                action={
                  <button
                    type="button"
                    className={buttonClasses('secondary', 'md')}
                    onClick={() => {
                      setQuery('');
                      setFilter('all');
                    }}
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
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
            )}
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onClose={setPollToClose}
                onDelete={setPollToDelete}
              />
            ))}
          </ul>
        )}
      </main>

      <ClosePollModal
        open={Boolean(pollToClose)}
        question={pollToClose?.question}
        onCancel={() => setPollToClose(null)}
        onConfirm={async () => {
          if (pollToClose) {
            try {
              await closePoll(pollToClose.id);
              toast.success('Poll closed successfully!');
            } catch (err) {
              toast.error(err.message || 'Could not close poll.');
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
        onConfirm={handleDelete}
      />
    </div>
  );
}
