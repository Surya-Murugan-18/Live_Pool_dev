import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
export function Dropdown({ trigger, items, align = 'right', label, className }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    useEffect(() => {
        if (!open)
            return undefined;
        const onPointerDown = (event) => {
            if (!containerRef.current?.contains(event.target))
                setOpen(false);
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                setOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);
    return (<div ref={containerRef} className={twMerge('relative', className)}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen((prev) => !prev)} className="rounded-lg transition-colors duration-150 ease-swift">
        
        {trigger({ open })}
      </button>
      <AnimatePresence>
        {open ?
            <motion.div role="menu" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }} className={twMerge('absolute top-[calc(100%+8px)] z-40 min-w-[190px] overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-lift', align === 'right' ? 'right-0' : 'left-0')}>
          
            {items.map((item) => <button key={item.label} type="button" role="menuitem" onClick={() => {
                        setOpen(false);
                        item.onSelect();
                    }} className={twMerge('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ease-swift', item.tone === 'danger' ?
                        'text-danger-600 hover:bg-danger-50' :
                        'text-ink hover:bg-canvas')}>
            
                {item.icon}
                {item.label}
              </button>)}
          </motion.div> :
            null}
      </AnimatePresence>
    </div>);
}
