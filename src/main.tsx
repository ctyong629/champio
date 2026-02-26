import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 新增這行
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 用 BrowserRouter 把 App 包起來 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)