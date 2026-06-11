import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Stats from './Stats.jsx'

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {path === '/stats' ? <Stats /> : <App />}
  </React.StrictMode>,
)
