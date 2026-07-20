import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safety patch to prevent errors when external sandboxes or extensions try to override window.fetch
try {
  let currentFetch = window.fetch;
  const applyPatch = (obj: any) => {
    try {
      const desc = Object.getOwnPropertyDescriptor(obj, 'fetch');
      if (!desc || desc.configurable) {
        Object.defineProperty(obj, 'fetch', {
          get() { return currentFetch; },
          set(newFetch) { currentFetch = newFetch; },
          configurable: true,
          enumerable: true
        });
        return true;
      }
    } catch (err) {}
    return false;
  };

  if (!applyPatch(window)) {
    applyPatch(Object.getPrototypeOf(window));
  }
} catch (e) {
  console.warn("Failed to patch window.fetch:", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
