import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';
import { AppNav } from '../components/layout/AppNav';
import { ShareCard } from '../components/ui/ShareCard';
import { QRCodeCard } from '../components/ui/QRCodeCard';
import { Modal } from '../components/ui/Modal';
import { buttonClasses } from '../components/ui/Button';
import { LiveIndicator } from '../components/ui/LiveIndicator';
import { PollNotFound } from './PollNotFound';
import { usePolls } from '../contexts/PollsContext';
import { pluralize, pollUrl } from '../utils/poll';
export function PollCreated() {
    const { pollId } = useParams();
    const { getPoll } = usePolls();
    const poll = getPoll(pollId);
    const [qrOpen, setQrOpen] = useState(false);
    if (!poll)
        return <PollNotFound />;
    const url = pollUrl(poll.id);
    return (<div className="flex min-h-full w-full flex-col bg-canvas">
      <AppNav />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 lg:py-14">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-live-50 text-live-600">
            <CheckIcon className="h-6 w-6" strokeWidth={3} aria-hidden="true"/>
          </span>
          <h1 className="mt-5 text-[26px] font-extrabold tracking-tight text-ink sm:text-3xl">
            Poll Created Successfully!
          </h1>
          <p className="mt-2 text-[15px] text-ink-muted">Your poll is ready to share.</p>
        </div>

        <section aria-label="Poll preview" className="mt-8 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
          
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold leading-snug tracking-tight text-ink">{poll.question}</h2>
            <LiveIndicator size="sm"/>
          </div>
          <p className="mt-2 text-sm text-ink-muted">{pluralize(poll.options.length, 'option')}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {poll.options.map((option) => <li key={option.id} className="rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-ink-muted">
              
                {option.label}
              </li>)}
          </ul>
        </section>

        <div className="mt-5">
          <ShareCard url={url} onShowQrCode={() => setQrOpen(true)}/>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link to={`/polls/${poll.id}/results`} className={buttonClasses('primary', 'lg', 'sm:flex-1')}>
            View Live Poll
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true"/>
          </Link>
          <Link to="/dashboard" className={buttonClasses('secondary', 'lg', 'sm:flex-1')}>
            Go to Dashboard
          </Link>
        </div>
      </main>

      <Modal open={qrOpen} title="Poll QR code" description="Project this on a screen so people in the room can join instantly." onClose={() => setQrOpen(false)} footer={<button type="button" className={buttonClasses('secondary', 'md')} onClick={() => setQrOpen(false)}>
            Done
          </button>}>
        
        <QRCodeCard url={url}/>
      </Modal>
    </div>);
}
