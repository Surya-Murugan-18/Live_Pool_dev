import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { heroPoll } from '../../data/polls';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { LiveIndicator } from '../ui/LiveIndicator';
import { LiveResultsPanel } from './LiveResultsPanel';
import { pluralize, totalVotes } from '../../utils/poll';
/** Self-contained marketing preview of the live results surface. */
export function LivePollPreview({ compact = false }) {
    const { liveUpdates, connectionState } = useAppConfig();
    const [options, setOptions] = useState(heroPoll.options);
    const [updated, setUpdated] = useState(null);
    useEffect(() => {
        if (!liveUpdates || connectionState !== 'connected')
            return undefined;
        let timer = 0;
        const schedule = () => {
            timer = window.setTimeout(() => {
                setOptions((prev) => {
                    const index = Math.floor(Math.random() * prev.length);
                    setUpdated({ id: prev[index].id, key: Date.now() });
                    return prev.map((option, i) => i === index ? { ...option, votes: option.votes + 1 } : option);
                });
                schedule();
            }, 2600 + Math.random() * 2200);
        };
        schedule();
        return () => window.clearTimeout(timer);
    }, [liveUpdates, connectionState]);
    const total = totalVotes(options);
    return (<section aria-label="Live results preview" className="rounded-2xl border border-line bg-white p-5 shadow-lift sm:p-6">
      
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle">Live results</p>
        <LiveIndicator size="sm"/>
      </div>

      <h3 className={compact ?
            'mt-3 text-[15px] font-bold leading-snug tracking-tight text-ink' :
            'mt-3 text-lg font-bold leading-snug tracking-tight text-ink'}>
        
        {heroPoll.question}
      </h3>

      <div className="mt-5">
        <LiveResultsPanel options={options} emphasis={compact ? 'compact' : 'default'} updatedOptionId={updated?.id ?? null} updateKey={updated?.key ?? 0}/>
        
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <p className="text-sm font-semibold text-ink tabular-nums">{pluralize(total, 'vote')}</p>
        <div className="relative h-5 w-24">
          <AnimatePresence>
            {updated ?
            <motion.span key={updated.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }} className="absolute right-0 text-xs font-semibold text-live-600">
              
                +1 vote
              </motion.span> :
            null}
          </AnimatePresence>
        </div>
      </div>
    </section>);
}
