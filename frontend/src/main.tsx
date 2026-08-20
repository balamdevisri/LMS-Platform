import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

if (typeof window !== 'undefined') {
  console.log('[BUILD AUDIT] KaizenQ Firebase cleanup v2 (Build 2026-08-20)');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
