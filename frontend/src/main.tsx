import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initSentry } from './config/sentry';
import App from './App';

// Initialise Sentry error tracking before the React tree mounts.
// This is a no-op when VITE_SENTRY_DSN is not set.
initSentry();

const rootElement = document.getElementById('app');
if (!rootElement) {
  throw new Error('Root element #app not found in the document.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
