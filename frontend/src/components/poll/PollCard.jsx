import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BarChart3Icon,
  CopyIcon,
  ExternalLinkIcon,
  LockIcon,
  MoreHorizontalIcon,
  Share2Icon,
  Trash2Icon,
} from 'lucide-react';
import { Dropdown } from '../ui/Dropdown';
import { StatusBadge } from '../ui/StatusBadge';
import { buttonClasses } from '../ui/Button';
import { formatCreatedAt, pluralize, pollUrl, totalVotes } from '../../utils/poll';

export function PollCard({ poll, onClose, onDelete }) {
  const navigate = useNavigate();
  const votes = totalVotes(poll.options);
  const isActive = poll.status === 'active';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl(poll.id));
    } catch {
      /* clipboard unavailable */
    }
    toast.success('Poll link copied!');
  };

  const menuItems = [
    {
      label: 'Live results',
      icon: <BarChart3Icon className="h-4 w-4" aria-hidden="true" />,
      onSelect: () => navigate(`/polls/${poll.id}/results`),
    },
    {
      label: 'Open public poll',
      icon: <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />,
      onSelect: () => navigate(`/poll/${poll.id}`),
    },
    {
      label: 'Copy link',
      icon: <CopyIcon className="h-4 w-4" aria-hidden="true" />,
      onSelect: copyLink,
    },
    ...(isActive
      ? [
          {
            label: 'Close poll',
            icon: <LockIcon className="h-4 w-4" aria-hidden="true" />,
            tone: 'danger',
            onSelect: () => onClose(poll),
          },
        ]
      : []),
    {
      label: 'Delete poll',
      icon: <Trash2Icon className="h-4 w-4" aria-hidden="true" />,
      tone: 'danger',
      onSelect: () => onDelete(poll),
    },
  ];

  return (
    <li className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-card transition-[box-shadow,border-color] duration-150 ease-swift hover:border-brand-200 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold leading-snug tracking-tight text-ink">
          <Link
            to={`/polls/${poll.id}`}
            className="rounded transition-colors duration-150 ease-swift hover:text-brand-700"
          >
            {poll.question}
          </Link>
        </h3>
        <StatusBadge status={poll.status} />
      </div>

      <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        <div className="flex gap-1">
          <dt className="sr-only">Options</dt>
          <dd>{pluralize(poll.options.length, 'option')}</dd>
        </div>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-line-strong" />
        <div className="flex gap-1">
          <dt className="sr-only">Votes</dt>
          <dd className="font-semibold text-ink tabular-nums">{pluralize(votes, 'vote')}</dd>
        </div>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-line-strong" />
        <div className="flex gap-1">
          <dt className="sr-only">Created</dt>
          <dd>Created {formatCreatedAt(poll.createdAt)}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center gap-2 pt-5">
        <Link to={`/polls/${poll.id}`} className={buttonClasses('secondary', 'sm')}>
          <BarChart3Icon className="h-4 w-4" aria-hidden="true" />
          {isActive ? 'View' : 'View results'}
        </Link>

        {isActive ? (
          <button type="button" onClick={copyLink} className={buttonClasses('ghost', 'sm')}>
            <Share2Icon className="h-4 w-4" aria-hidden="true" />
            Share
          </button>
        ) : null}

        <Dropdown
          className="ml-auto"
          label={`More actions for ${poll.question}`}
          trigger={() => (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors duration-150 ease-swift hover:bg-canvas hover:text-ink">
              <MoreHorizontalIcon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
          items={menuItems}
        />
      </div>
    </li>
  );
}
