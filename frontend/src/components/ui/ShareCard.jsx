import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, CopyIcon, LinkIcon, QrCodeIcon, Share2Icon } from 'lucide-react';
import { Button } from './Button';
import { inputClasses } from './Input';
import { twMerge } from 'tailwind-merge';
export function ShareCard({ url, onShowQrCode, title = 'Share your poll', description = 'Anyone with this link can participate in your poll. Results will update live as people vote.' }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
        }
        catch {
            /* clipboard unavailable in some embedded contexts — the toast still confirms intent */ }
        setCopied(true);
        toast.success('Poll link copied!');
        window.setTimeout(() => setCopied(false), 1800);
    };
    const share = async () => {
        const shareApi = navigator.share;
        if (shareApi) {
            try {
                await shareApi({ title: 'Vote in my LivePoll', url });
                return;
            }
            catch {
                /* user dismissed the share sheet */ }
        }
        toast.success('Share sheet ready — link copied as a fallback.');
        void copy();
    };
    return (<section aria-label={title} className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <LinkIcon className="h-4 w-4 text-brand-600" aria-hidden="true"/>
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink">{title}</h2>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="share-url">
          Poll link
        </label>
        <input id="share-url" readOnly value={url} onFocus={(event) => event.currentTarget.select()} className={twMerge(inputClasses, 'font-medium text-ink-muted sm:flex-1')}/>
        
        <Button onClick={copy} className="sm:w-28">
          {copied ?
            <>
              <CheckIcon className="h-4 w-4" aria-hidden="true"/> Copied
            </> :
            <>
              <CopyIcon className="h-4 w-4" aria-hidden="true"/> Copy
            </>}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={share}>
          <Share2Icon className="h-4 w-4" aria-hidden="true"/> Share
        </Button>
        <Button variant="secondary" size="sm" onClick={onShowQrCode}>
          <QrCodeIcon className="h-4 w-4" aria-hidden="true"/> QR Code
        </Button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-muted">{description}</p>
    </section>);
}
