import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StompSessionProvider } from 'react-stomp-hooks'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StompSessionProvider url={"http://localhost:8080/chat"}>
      <App />
    </StompSessionProvider>
  </React.StrictMode>,
)
