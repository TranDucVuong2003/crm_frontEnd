import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/style/index.css'
import App from './App.jsx'
import React from 'react'
import 'sweetalert2/dist/sweetalert2.min.css'
import './assets/style/sweetalert-custom.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
