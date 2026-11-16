import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { profileApi } from './services/profileApi.js'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App repository={profileApi} />
  </StrictMode>,
)

