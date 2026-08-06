import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { App } from './App';
import { API_CONFIG_ERROR } from './lib/api';
import { hydrate } from './lib/storage';
import { hideSplash, initNative } from './lib/nativeBootstrap';
import { NATIVE } from './lib/platform';
import { initTheme } from './lib/theme';
import { ToastProvider } from './components/ui/Toast';
import './fonts';
import 'flag-icons/css/flag-icons.min.css';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Ethiopian mobile data drops often; one extra retry is worth more than
      // it costs, and cached data stays readable while the retry runs.
      retry: NATIVE ? 2 : 1,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
});

/** Shown instead of the app when the build itself is misconfigured. */
function BootError({ message }: { message: string }) {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: '#b91c1c' }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Configuration error</h1>
      <p style={{ fontSize: 14, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}

async function boot() {
  // Must finish before the first render: the auth context and t() read the
  // store synchronously, and on Android it is only readable after this await.
  await hydrate();
  // Before first paint, so the app never flashes light then snaps to dark.
  initTheme();
  await initNative();

  // Disables text selection / overscroll glow on app chrome (see index.css).
  if (NATIVE) document.body.classList.add('native-app');

  const root = ReactDOM.createRoot(document.getElementById('root')!);

  if (API_CONFIG_ERROR) {
    root.render(<BootError message={API_CONFIG_ERROR} />);
  } else {
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </React.StrictMode>,
    );
  }

  void hideSplash();
}

void boot();
