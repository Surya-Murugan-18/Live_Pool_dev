import { useEffect, useState } from 'react';

/**
 * Returns `true` once the screen should stop showing skeleton placeholders.
 *
 * When called with no argument (or a number) it behaves as before — fires after
 * a short delay so even instant responses feel intentional.
 *
 * When called with a boolean `loading` it stays `false` while loading is true
 * and additionally requires the minimum delay to have elapsed, so skeletons
 * never flash for < 300 ms on fast connections.
 */
export function useDelayedReady(loading) {
  const isBoolean = typeof loading === 'boolean';
  const minDelay = isBoolean ? 300 : (loading ?? 650);

  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setTimerDone(true), minDelay);
    return () => window.clearTimeout(id);
    // minDelay is stable after first render — intentionally omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isBoolean) {
    // Ready once the minimum delay has elapsed AND loading is no longer true
    return timerDone && !loading;
  }
  return timerDone;
}
