import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { tokenStore } from '../lib/api';

/**
 * One socket per mounted consumer, authenticated with the JWT access token.
 * `handlers` maps event name → callback; they are attached for the lifetime
 * of the component.
 */
export function useSocket(handlers: Record<string, (payload: never) => void>): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket: Socket = io({ auth: { token: tokenStore.access } });

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
