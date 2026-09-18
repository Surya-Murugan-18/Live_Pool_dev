import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  BarChart3Icon,
  CalendarIcon,
  CopyIcon,
  ExternalLinkIcon,
  LockIcon,
  QrCodeIcon,
  Share2Icon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
import { AppNav } from '../components/layout/AppNav';
import { LiveResultsPanel } from '../components/poll/LiveResultsPanel';
import { ClosePollModal } from '../components/poll/ClosePollModal';
import { DeletePollModal } from '../components/poll/DeletePollModal';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConnectionStatus } from '../components/ui/ConnectionStatus';
import { QRCodeCard } from '../components/ui/QRCodeCard';
import { Modal } from '../components/ui/Modal';
import { Button, buttonClasses } from '../components/ui/Button';
import { ResultsSkeleton } from '../components/ui/LoadingSkeleton';
import { PollNotFound } from './PollNotFound';
import { usePolls } from '../contexts/PollsContext';
import { useLiveFeed } from '../hooks/useLiveFeed';
import { formatLongDate, pollUrl, totalVotes } from '../utils/poll';

export function PollManagement() {
  const { pollId } = useParams();
  const { getPoll, closePoll, deletePoll, lastEvents, ensurePoll } = usePolls();
  const navigate = useNavigate();

  const [fetchState, setFetchState] = useState('loading');
  const [closeOpen, setCloseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        <AppNav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
          <ResultsSkeleton rows={3} />
        </main>
      </div>
    );
  }

  if (fetchState === 'notfound' || !poll) {
    return <PollNotFound />;
  }

  const url = pollUrl(poll.id);
  const total = totalVotes(poll.options);
  const event = lastEvents[poll.id];
  const isActive = poll.status === 'active';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard unavailable */
    }
    toast.success('Poll link copied!');
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Vote in my LivePoll', url });
        return;
      } catch {
        /* dismissed */
      }
    }
    void copyLink();
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      await closePoll(poll.id);
      setCloseOpen(false);
      toast.success('Poll closed successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not close poll.');
    } finally {
      setClosing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePoll(poll.id);
      toast.success('Poll deleted.');
      navigate('/polls');
    } catch (err) {
      toast.error(err.message || 'Could not delete poll.');
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-canvas">
      <AppNav />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <Link
          to="/polls"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-swift hover:text-ink"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          My Polls
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
              Poll Details
            </p>
            <h1 className="mt-2 max-w-2xl text-[26px] font-extrabold leading-snug tracking-tight text-ink sm:text-[32px]">
              {poll.question}
            </h1>
          </div>
          <StatusBadge status={poll.status} className="shrink-0" />
        </div>

        {!isActive ? (
          <p className="mt-4 rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink-muted">
            Voting is no longer available. Final results stay visible to anyone with the link.
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Results panel */}
          <section
            aria-labelledby="results-heading"
            className="rounded-xl border border-line bg-white p-5 shadow-card sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                id="results-heading"
                className="flex items-center gap-2 text-sm font-bold text-ink"
              >
                <BarChart3Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                {isActive ? 'Live Results' : 'Final Results'}
              </h2>
              {isActive ? <ConnectionStatus size="sm" note="" /> : null}
            </div>

            <div className="mt-6">
              {fetchState === 'loading' ? (
                <ResultsSkeleton rows={poll.options.length} />
              ) : (
                <LiveResultsPanel
                  options={poll.options}
                  dimmed={!isActive}
                  updatedOptionId={isActive ? event?.optionId ?? null : null}
                  updateKey={event?.at ?? 0}
                />
              )}
            </div>

            <Link
              to={`/polls/${poll.id}/results`}
              className={buttonClasses('primary', 'sm', 'mt-7')}
            >
              Open full live results
            </Link>
          </section>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                Metadata
              </h2>
              <dl className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon
                    className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-xs text-ink-muted">Created</dt>
                    <dd className="text-sm font-semibold text-ink">
                      {formatLongDate(
                        typeof poll.createdAt === 'string'
                          ? poll.createdAt.slice(0, 10)
                          : new Date(poll.createdAt).toISOString().slice(0, 10)
                      )}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UsersIcon
                    className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-xs text-ink-muted">Total votes</dt>
                    <dd className="text-sm font-semibold text-ink tabular-nums">{total}</dd>
                  </div>
                </div>
              </dl>
            </Card>

            <Card>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                Actions
              </h2>
              <div className="mt-4 space-y-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={copyLink}
                  className="justify-start"
                >
                  <CopyIcon className="h-4 w-4" aria-hidden="true" />
                  Copy Link
                </Button>
                <Button variant="secondary" fullWidth onClick={share} className="justify-start">
                  <Share2Icon className="h-4 w-4" aria-hidden="true" />
                  Share
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setQrOpen(true)}
                  className="justify-start"
                >
                  <QrCodeIcon className="h-4 w-4" aria-hidden="true" />
                  QR Code
                </Button>
                <Link
                  to={`/poll/${poll.id}`}
                  className={buttonClasses('secondary', 'md', 'w-full justify-start')}
                >
                  <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
                  View Public Poll
                </Link>
                {isActive ? (
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => setCloseOpen(true)}
                    className="justify-start"
                  >
                    <LockIcon className="h-4 w-4" aria-hidden="true" />
                    Close Poll
                  </Button>
                ) : null}
                {/* Delete — always visible regardless of status */}
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => setDeleteOpen(true)}
                  className="justify-start border-danger-100 bg-danger-50 text-danger-600 hover:bg-danger-100"
                >
                  <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                  Delete Poll
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <ClosePollModal
        open={closeOpen}
        question={poll.question}
        onCancel={() => setCloseOpen(false)}
        onConfirm={handleClose}
        loading={closing}
      />

      <DeletePollModal
        open={deleteOpen}
        question={poll.question}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />

      <Modal
        open={qrOpen}
        title="Poll QR code"
        description="Anyone can scan this to open the voting page."
        onClose={() => setQrOpen(false)}
        footer={
          <button
            type="button"
            className={buttonClasses('secondary', 'md')}
            onClick={() => setQrOpen(false)}
          >
            Done
          </button>
        }
      >
        <QRCodeCard url={url} />
      </Modal>
    </div>
  );
}
