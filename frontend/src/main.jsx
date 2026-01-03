import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store, { persistor } from './store/index.js';
import { PersistGate } from 'redux-persist/integration/react';
import { AudioProvider } from './context/AudioContext.jsx';
import './index.css';
import App from './App.jsx';

// SECURITY/MIGRATION NOTE:
// We no longer persist the `cards` slice (it contained hidden card assignments).
// Purge any previously persisted state once so old `persist:root` data doesn't linger.
try {
  const didPurge = localStorage.getItem('didPurgePersistRoot');
  if (!didPurge) {
    persistor.purge();
    localStorage.setItem('didPurgePersistRoot', 'true');
  }
} catch {
  // ignore (e.g., SSR or storage blocked)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AudioProvider>
          <App />
        </AudioProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
