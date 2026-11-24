import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { dibujarCertificado, aBlob, compartir, descargar, nombreArchivo } from './certificado.js'

// Botón + vista previa del certificado con "Compartir" y "Descargar".
// Usa estilos en línea para no depender del CSS de cada juego.
const btn = (fondo, color = '#fff') => ({
  font: 'inherit', fontWeight: 800, cursor: 'pointer', border: 0, borderRadius: 12,
  padding: '12px 20px', background: fondo, color, boxShadow: '0 3px 0 rgba(0,0,0,.2)',
})

export default function CertificadoBoton({ datos, etiqueta = '🎓 Ver mi certificado', className = 'go', style }) {
  const [abierto, setAbierto] = useState(false)
  const [img, setImg] = useState(null)
  const [aviso, setAviso] = useState('')
  const blobRef = useState({ blob: null })[0]

  useEffect(() => {
    if (!abierto) return
    let vivo = true
    const canvas = dibujarCertificado(datos)
    setImg(canvas.toDataURL('image/png'))
    aBlob(canvas).then((b) => { if (vivo) blobRef.blob = b })
    return () => { vivo = false }
  }, [abierto, datos, blobRef])

  useEffect(() => {
    if (!abierto) return
    const esc = (e) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [abierto])

  const obtenerBlob = async () => blobRef.blob || aBlob(dibujarCertificado(datos))

  const onCompartir = async () => {
    const r = await compartir(await obtenerBlob(), datos)
    setAviso(r === 'descargado' ? 'Tu navegador no puede compartir directo: se descargó la imagen para que la envíes.' : r === 'compartido' ? '¡Listo!' : '')
  }
  const onDescargar = async () => {
    descargar(await obtenerBlob(), nombreArchivo(datos))
    setAviso('Imagen descargada.')
  }

  return (
    <>
      <button className={className} style={style} onClick={() => { setAviso(''); setAbierto(true) }}>{etiqueta}</button>
      <AnimatePresence>
        {abierto && (
          <motion.div
            role="dialog" aria-modal="true" aria-label="Certificado"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setAbierto(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(15,23,42,.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'auto' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 18, padding: 16, maxWidth: 860, width: '100%', textAlign: 'center', color: '#1e293b' }}
            >
              {img ? <img src={img} alt={`Certificado de ${datos.nombre}`} style={{ width: '100%', height: 'auto', borderRadius: 10, display: 'block', boxShadow: '0 6px 24px rgba(0,0,0,.18)' }} /> : <p>Generando…</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
                <button style={btn('linear-gradient(135deg,#22c55e,#16a34a)')} onClick={onCompartir}>📤 Compartir</button>
                <button style={btn('linear-gradient(135deg,#7c3aed,#4f46e5)')} onClick={onDescargar}>⬇️ Descargar imagen</button>
                <button style={btn('#e2e8f0', '#334155')} onClick={() => setAbierto(false)}>Cerrar</button>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 13, color: '#64748b', minHeight: 18 }}>{aviso || 'En el celular, "Compartir" abre WhatsApp y tus redes.'}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
