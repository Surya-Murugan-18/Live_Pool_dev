import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, LockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PublicNav } from '../components/layout/PublicNav';
import { VoteOption } from '../components/poll/VoteOption';
import { LiveResultsPanel } from '../components/poll/LiveResultsPanel';
import { Button } from '../components/ui/Button';
import { ConnectionStatus } from '../components/ui/ConnectionStatus';
import { Skeleton } from '../components/ui/LoadingSkeleton';
import { PollNotFound } from './PollNotFound';
import { usePolls } from '../contexts/PollsContext';
import { useAppConfig } from '../contexts/AppConfigContext';
import { useLiveFeed } from '../hooks/useLiveFeed';
import { pluralize, totalVotes } from '../utils/poll';

const VOTED_KEY = (id) => `livepoll_voted_${id}`;

export function PublicPoll() {
  const { pollId } = useParams();
  const { getPoll, ensurePoll, castVote, lastEvents } = usePolls();
  const { connectionState } = useAppConfig();

  const [fetchState, setFetchState] = useState('loading'); // 'loading' | 'found' | 'notfound'
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Persist voted state in sessionStorage so a page refresh keeps the result view
  const [voted, setVoted] = useState(() => Boolean(sessionStorage.getItem(VOTED_KEY(pollId))));

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
  useLiveFeed(poll?.id, fetchState === 'found' && Boolean(poll));

  if (fetchState === 'loading') {
    return (
      <div className="flex min-h-full w-full flex-col bg-canvas">
        <PublicNav status="active" />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-4 h-7 w-4/5" />
            <div className="mt-8 space-y-3">
              <Skeleton className="h-[60px] rounded-xl" />
              <Skeleton className="h-[60px] rounded-xl" />
              <Skeleton className="h-[60px] rounded-xl" />
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
  const event = lastEvents[poll.id];
  const isClosed = poll.status === 'closed';

  const submit = async () => {
    if (!selected) return;
    if (connectionState === 'disconnected') {
      toast.error('Unable to submit your vote.');
      return;
    }
    setSubmitting(true);
    try {
      await castVote(poll.id, selected);
      sessionStorage.setItem(VOTED_KEY(pollId), '1');
      setVoted(true);
      toast.success('Vote submitted!');
    } catch (err) {
      toast.error(err.message || 'Could not submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-canvas">
      <PublicNav status={poll.status} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {isClosed ? (
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
              <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              POLL CLOSED
            </span>
            <h1 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-[28px]">
              {poll.question}
            </h1>
            <p className="mt-2 text-[15px] text-ink-muted">
              This poll is no longer accepting votes.
            </p>
            <div className="mt-8 border-t border-line pt-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                  Final results
                </h2>
                <p className="text-sm font-semibold text-ink tabular-nums">
                  {pluralize(total, 'vote')}
                </p>
              </div>
              <div className="mt-5">
                <LiveResultsPanel options={poll.options} dimmed />
              </div>
            </div>
          </section>
        ) : voted ? (
          <motion.section
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl border border-line bg-white p-5 text-center shadow-card sm:p-8"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-live-50 text-live-600">
              <CheckIcon className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">
              Vote submitted!
            </h1>
            <p className="mt-2 text-[15px] text-ink-muted">Thanks for participating.</p>
            <p className="mt-1 text-sm font-medium text-live-600">Results are updating live…</p>

            <div className="mt-8 border-t border-line pt-6 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                  Live results
                </h2>
                <ConnectionStatus size="sm" note="" />
              </div>
              <p className="mt-2 text-sm font-semibold text-ink tabular-nums">
                {pluralize(total, 'vote')}
              </p>
              <div className="mt-5">
                <LiveResultsPanel
                  options={poll.options}
                  updatedOptionId={event?.optionId ?? null}
                  updateKey={event?.at ?? 0}
                />
              </div>
            </div>
          </motion.section>
        ) : (
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
              Your Vote Matters
            </p>
            <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-[28px]">
              {poll.question}
            </h1>
            <p className="mt-2 text-[15px] text-ink-muted">Choose one option.</p>

            <fieldset className="mt-7">
              <legend className="sr-only">{poll.question}</legend>
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <VoteOption
                    key={option.id}
                    id={`vote-${option.id}`}
                    name="poll-option"
                    label={option.label}
                    selected={selected === option.id}
                    disabled={submitting}
                    onSelect={() => setSelected(option.id)}
                  />
                ))}
              </div>
            </fieldset>

            <div className="mt-7">
              <Button
                size="lg"
                fullWidth
                onClick={submit}
                disabled={!selected}
                loading={submitting}
                loadingLabel="Submitting…"
              >
                Submit Vote
              </Button>
              <AnimatePresence>
                {!selected ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    className="mt-2 text-center text-xs text-ink-subtle"
                  >
                    Select an option to continue.
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="mt-7 flex flex-col items-center gap-2 border-t border-line pt-5 text-center">
              <p className="text-sm font-semibold text-ink tabular-nums">
                {total} people have voted
              </p>
              <ConnectionStatus size="sm" note="Results update live" />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
