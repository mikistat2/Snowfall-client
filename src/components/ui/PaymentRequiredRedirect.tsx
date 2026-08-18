import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PAYMENT_REQUIRED_EVENT } from '../../lib/api';

/**
 * Sends the user to /billing the moment any API call reports the subscription
 * has lapsed (402 PAYMENT_REQUIRED). Mounted once in the app shell, so it
 * works on every page — otherwise pages would just sit on "Loading…".
 *
 * This is a CONVENIENCE redirect only. The paywall is enforced independently
 * by the API middleware, so a tampered client cache buys nothing but 402s.
 */
export function PaymentRequiredRedirect() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handler = () => {
      if (pathname !== '/billing') navigate('/billing', { replace: true });
    };
    window.addEventListener(PAYMENT_REQUIRED_EVENT, handler);
    return () => window.removeEventListener(PAYMENT_REQUIRED_EVENT, handler);
  }, [navigate, pathname]);

  return null;
}
