import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import ErrorBoundary from './components/shared/ErrorBoundary'
import { startKeepAlive } from './lib/keepAlive'
import './index.css'

startKeepAlive()

window.addEventListener('online', () => {
  const toast = document.createElement('div')
  toast.textContent = '✅ Back online'
  toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#1D9E75;color:white;padding:10px 20px;border-radius:10px;font-weight:700;z-index:9999;font-family:Inter,sans-serif;font-size:14px'
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
})

window.addEventListener('offline', () => {
  const toast = document.createElement('div')
  toast.textContent = '⚠️ No internet connection'
  toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:10px 20px;border-radius:10px;font-weight:700;z-index:9999;font-family:Inter,sans-serif;font-size:14px'
  document.body.appendChild(toast)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
