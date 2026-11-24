import { lazy, Suspense, useEffect, useState } from 'react'
import Hub from './hub/Hub.jsx'

// Cada juego se carga solo cuando se abre (el menú inicial pesa poco).
const CodeBotApp = lazy(() => import('./games/codebot/CodeBotApp.jsx'))
const CodeQuestApp = lazy(() => import('./games/codequest/CodeQuestApp.jsx'))
const PanelPage = lazy(() => import('./games/codebot/pages/PanelPage.jsx'))

// Rutas por "hash" para que el botón Atrás del navegador funcione y se puedan compartir enlaces directos:
//   /            → menú          /#/codebot → CodeBot
//   /#/codequest → CodeQuest     /#/panel   → panel del profesor
// Los parámetros ?grupo=A&sesion=Clase1 se conservan al navegar.
const rutaDe = (hash) =>
  hash.startsWith('#/codebot') ? 'codebot'
  : hash.startsWith('#/codequest') ? 'codequest'
  : hash.startsWith('#/panel') ? 'panel'
  : 'hub'

const Cargando = () => (
  <div style={{ padding: 24, font: '16px system-ui, sans-serif', color: '#64748b' }}>Cargando…</div>
)

export default function App() {
  const [ruta, setRuta] = useState(() => rutaDe(window.location.hash))

  useEffect(() => {
    const cambio = () => {
      setRuta(rutaDe(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', cambio)
    return () => window.removeEventListener('hashchange', cambio)
  }, [])

  if (ruta === 'hub') return <Hub />
  return (
    <Suspense fallback={<Cargando />}>
      {ruta === 'codebot' && <CodeBotApp />}
      {ruta === 'codequest' && <CodeQuestApp />}
      {ruta === 'panel' && <PanelPage />}
    </Suspense>
  )
}
