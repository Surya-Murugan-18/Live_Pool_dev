import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { pollsApi } from '../lib/api';
import { useAuth } from './AuthContext';

const PollsContext = createContext(null);

export function PollsProvider({ children }) {
  const { isAuthenticated } = useAuth();

  // polls owned by the authenticated user
  const [polls, setPolls] = useState([]);
  const [pollsLoading, setPollsLoading] = useState(false);

  // per-poll cache used by public pages (PublicPoll, LiveResults, PollManagement)
  // keyed by poll id, value: Poll object
  const [pollCache, setPollCache] = useState({});

  // last real-time events received via WebSocket, keyed by poll id
  const [lastEvents, setLastEvents] = useState({});

  const pollsRef = useRef(polls);
  useEffect(() => {
    pollsRef.current = polls;
  }, [polls]);

  // -------------------------------------------------------------------------
  // Fetch the authenticated user's polls list
  // -------------------------------------------------------------------------
  const fetchPolls = useCallback(async () => {
    if (!isAuthenticated) return;
    setPollsLoading(true);
    try {
      const data = await pollsApi.list();
      setPolls(data ?? []);
    } catch {
      // silently ignore — UI shows empty state
    } finally {
      setPollsLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh list whenever the user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchPolls();
    } else {
      setPolls([]);
    }
  }, [isAuthenticated, fetchPolls]);

  // -------------------------------------------------------------------------
  // Get a single poll — checks owned list first, then falls back to a cache
  // hit or a fresh API fetch (used by public pages that have no auth).
  // -------------------------------------------------------------------------
  const getPoll = useCallback(
    (id) => {
      // Check the authenticated user's list first
      const owned = polls.find((p) => p.id === id);
      if (owned) return owned;
      // Fall back to the public cache
      return pollCache[id] ?? null;
    },
    [polls, pollCache]
  );

  /**
   * Ensure a poll is in the cache. If it is already present (from the owned
   * list or a prior fetch) this is a no-op; otherwise it fetches from the API.
   * Returns the poll, or null on error.
   */
  const ensurePoll = useCallback(
    async (id) => {
      if (!id) return null;
      // Already in owned list
      const owned = pollsRef.current.find((p) => p.id === id);
      if (owned) return owned;
      // Already in cache
      if (pollCache[id]) return pollCache[id];
      // Fetch from API
      try {
        const poll = await pollsApi.get(id);
        setPollCache((prev) => ({ ...prev, [poll.id]: poll }));
        return poll;
      } catch {
        return null;
      }
    },
    [pollCache]
  );

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------

  const createPoll = useCallback(
    async (input) => {
      const poll = await pollsApi.create({
        question: input.question.trim(),
        options: input.options.map((o) => o.trim()),
        allowOneVote: input.allowOneVote,
      });
      // Prepend to the owned list and add to cache
      setPolls((prev) => [poll, ...prev]);
      setPollCache((prev) => ({ ...prev, [poll.id]: poll }));
      return poll;
    },
    []
  );

  const closePoll = useCallback(async (id) => {
    const updated = await pollsApi.close(id);
    setPolls((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setPollCache((prev) => ({ ...prev, [id]: updated }));
    return updated;
  }, []);

  const deletePoll = useCallback(async (id) => {
    await pollsApi.delete(id);
    setPolls((prev) => prev.filter((p) => p.id !== id));
    setPollCache((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  /**
   * castVote — submits a real vote, then updates local state with the
   * server-returned poll so counts stay accurate.
   */
  const castVote = useCallback(async (pollId, optionId) => {
    const updated = await pollsApi.vote(pollId, optionId);
    setPolls((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
    setPollCache((prev) => ({ ...prev, [pollId]: updated }));
    return updated;
  }, []);

  /**
   * applyRemoteVote — called by the WebSocket hook when a real-time message
   * arrives. Merges the server-pushed vote counts into local state.
   */
  const applyRemoteVote = useCallback((pollId, optionId, serverOptions) => {
    const merge = (poll) =>
      poll.id === pollId
        ? { ...poll, options: serverOptions ?? poll.options }
        : poll;

    setPolls((prev) => prev.map(merge));
    setPollCache((prev) =>
      prev[pollId] ? { ...prev, [pollId]: merge(prev[pollId]) } : prev
    );
    setLastEvents((prev) => ({
      ...prev,
      [pollId]: { pollId, optionId, at: Date.now() },
    }));
  }, []);

  const value = useMemo(
    () => ({
      polls,
      pollsLoading,
      lastEvents,
      getPoll,
      ensurePoll,
      createPoll,
      closePoll,
      deletePoll,
      castVote,
      applyRemoteVote,
      refreshPolls: fetchPolls,
    }),
    [
      polls,
      pollsLoading,
      lastEvents,
      getPoll,
      ensurePoll,
      createPoll,
      closePoll,
      deletePoll,
      castVote,
      applyRemoteVote,
      fetchPolls,
    ]
  );

  return <PollsContext.Provider value={value}>{children}</PollsContext.Provider>;
}

export function usePolls() {
  const ctx = useContext(PollsContext);
  if (!ctx) throw new Error('usePolls must be used inside a PollsProvider');
  return ctx;
}
