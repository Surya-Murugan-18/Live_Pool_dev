import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
export function Modal({ open, title, description, onClose, children, footer, icon }) {
    const panelRef = useRef(null);
    useEffect(() => {
        if (!open)
            return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        panelRef.current?.focus();
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);
    return (<AnimatePresence>
      {open ?
            <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }} onClick={onClose} className="absolute inset-0 bg-ink/40"/>
        
          <motion.div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} className="relative w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-modal focus:outline-none">
          
            <button type="button" onClick={onClose} aria-label="Close dialog" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 ease-swift hover:bg-canvas hover:text-ink">
            
              <XIcon className="h-4 w-4" aria-hidden="true"/>
            </button>
            {icon ? <div className="mb-4">{icon}</div> : null}
            <h2 className="pr-8 text-lg font-bold tracking-tight text-ink">{title}</h2>
            {description ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p> : null}
            {children ? <div className="mt-4">{children}</div> : null}
            {footer ? <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div> : null}
          </motion.div>
        </div> :
            null}
    </AnimatePresence>);
}
