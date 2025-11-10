// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx' // <--- IMPORTAR

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <--- ENVOLVER LA APP */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)