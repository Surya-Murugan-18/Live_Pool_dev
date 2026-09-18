import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2Icon, WifiOffIcon } from 'lucide-react';
import { useAppConfig } from '../../contexts/AppConfigContext';
/** Small, non-blocking indicator so a dropped socket is never a silent failure. */
export function ConnectionBanner() {
    const { connectionState } = useAppConfig();
    const visible = connectionState !== 'connected';
    return (<AnimatePresence>
      {visible ?
            <motion.div role="status" aria-live="polite" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} className="fixed bottom-4 left-4 z-40 flex items-center gap-2.5 rounded-full border border-line bg-white px-4 py-2.5 shadow-lift">
        
          {connectionState === 'connecting' ?
                    <>
              <Loader2Icon className="h-4 w-4 animate-spin text-warn-500" aria-hidden="true"/>
              <span className="text-sm font-semibold text-ink">Connecting…</span>
            </> :
                    <>
              <WifiOffIcon className="h-4 w-4 text-danger-500" aria-hidden="true"/>
              <span className="text-sm font-semibold text-ink">Connection lost</span>
              <span className="text-sm text-ink-muted">Trying to reconnect…</span>
            </>}
        </motion.div> :
            null}
    </AnimatePresence>);
}
