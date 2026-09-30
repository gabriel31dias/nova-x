import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DocsScreen } from './screens/DocsScreen';
import './index.css';

// html has zoom: 0.9. Browsers disagree on whether 100vh shrinks with it, so measure how tall
// 100vh actually renders and scale the full-height helpers to fill exactly the real viewport.
const fitViewport = () => {
  const probe = document.body.appendChild(document.createElement('div'));
  probe.style.cssText = 'position:absolute;top:0;height:100vh;visibility:hidden';
  const rendered = probe.getBoundingClientRect().height;
  probe.remove();
  if (rendered) document.documentElement.style.setProperty('--vh-fix', String(window.innerHeight / rendered));
};
fitViewport();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* ponytail: single public route, no router lib; add one if more public pages appear */}
    {window.location.pathname.replace(/\/$/, '') === '/docs' ? <DocsScreen /> : <App />}
  </React.StrictMode>
);
