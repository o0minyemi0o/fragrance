import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens/index.css'  // 디자인 토큰 시스템
import './main.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
