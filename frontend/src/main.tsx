import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { HelmetProvider } from 'react-helmet-async'

if (typeof window !== 'undefined') {
  console.log('[BUILD AUDIT] KaizenQ Firebase cleanup v2 (Build 2026-08-20)');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
