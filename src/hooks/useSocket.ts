import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_ORIGIN, tokenStore } from '../lib/api';

/**
 * One socket per mounted consumer, authenticated with the JWT access token.
 * `handlers` maps event name → callback; they are attached for the lifetime
 * of the component.
 */
export function useSocket(handlers: Record<string, (payload: never) => void>): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    // separate API origin in production (Vercel client → Render API);
    // same-origin through the Vite proxy in dev
    const socket: Socket = API_ORIGIN
      ? io(API_ORIGIN, { auth: { token: tokenStore.access } })
      : io({ auth: { token: tokenStore.access } });

    const events = Object.keys(handlersRef.current);
    for (const event of events) {
      socket.on(event, (payload) => {
        (handlersRef.current[event] as ((p: unknown) => void) | undefined)?.(payload);
      });
    }
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
