import { useEffect, useState } from 'react';
/** Re-renders on an interval so relative timestamps stay honest. */
export function useTicker(enabled, intervalMs = 1000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!enabled)
            return undefined;
        const id = window.setInterval(() => setNow(Date.now()), intervalMs);
        return () => window.clearInterval(id);
    }, [enabled, intervalMs]);
    return now;
}
