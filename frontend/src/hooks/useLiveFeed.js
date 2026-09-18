import { useEffect, useRef } from 'react';
import { useAppConfig } from '../contexts/AppConfigContext';
import { usePolls } from '../contexts/PollsContext';
import { API_URL } from '../lib/api';

/**
 * Opens a WebSocket to /api/polls/:pollId/stream and pipes incoming vote
 * events into PollsContext.applyRemoteVote.
 *
 * Automatically reconnects with exponential back-off when the connection drops
 * (unless the component unmounts or the poll is no longer active).
 */
export function useLiveFeed(pollId, active) {
  const { applyRemoteVote } = usePolls();
  const { connectionState, liveUpdates } = useAppConfig();
  const wsRef = useRef(null);
  const retryRef = useRef(null);
  const retryDelay = useRef(1000);

  useEffect(() => {
    // Derive the WebSocket base URL from the HTTP API URL
    // e.g. http://localhost:8080/api  →  ws://localhost:8080/api
    const wsBase = API_URL.replace(/^https?/, (p) => (p === 'https' ? 'wss' : 'ws'));

    function connect() {
      if (!pollId || !active || !liveUpdates || connectionState !== 'connected') return;

      const ws = new WebSocket(`${wsBase}/polls/${pollId}/stream`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Expected shape: { pollId, optionId, votes: Option[], totalVotes }
          if (data.pollId && data.optionId) {
            applyRemoteVote(data.pollId, data.optionId, data.votes ?? null);
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!active) return;
        // Exponential back-off: 1s → 2s → 4s → cap at 30s
        retryRef.current = window.setTimeout(() => {
          retryDelay.current = Math.min(retryDelay.current * 2, 30_000);
          connect();
        }, retryDelay.current);
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onopen = () => {
        // Reset back-off on successful connection
        retryDelay.current = 1000;
      };
    }

    connect();

    return () => {
      // Prevent reconnect attempts after unmount
      window.clearTimeout(retryRef.current);
      if (wsRef.current) {
        // Overwrite onclose so the cleanup close doesn't trigger a reconnect
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [pollId, active, liveUpdates, connectionState, applyRemoteVote]);
}
