import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// No se importa ningún CSS global: cada pantalla carga el suyo (ver shell/StyleScope.jsx),
// porque CodeBot y CodeQuest usan las mismas clases (.card, .row, .go…) con estilos distintos.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
