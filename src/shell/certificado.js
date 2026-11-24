// Genera el certificado como imagen PNG (canvas), lista para compartir.
const W = 1600
const H = 1130
const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

function degradado(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, '#06b6d4')
  g.addColorStop(0.5, '#7c3aed')
  g.addColorStop(1, '#f97316')
  return g
}

function rectRedondeado(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Ajusta el tamaño de letra para que el texto quepa en el ancho dado
function ajustar(ctx, texto, fuente, max, desde, hasta = 40) {
  let t = desde
  do {
    ctx.font = fuente(t)
    t -= 2
  } while (ctx.measureText(texto).width > max && t > hasta)
}

function estrella(ctx, cx, cy, R, r, color) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? R : r
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

function sello(ctx, cx, cy, etiqueta) {
  // cintas
  ctx.fillStyle = '#f97316'
  ctx.beginPath(); ctx.moveTo(cx - 52, cy + 40); ctx.lineTo(cx - 92, cy + 150); ctx.lineTo(cx - 52, cy + 128); ctx.lineTo(cx - 14, cy + 150); ctx.lineTo(cx - 6, cy + 50); ctx.fill()
  ctx.fillStyle = '#ea580c'
  ctx.beginPath(); ctx.moveTo(cx + 52, cy + 40); ctx.lineTo(cx + 92, cy + 150); ctx.lineTo(cx + 52, cy + 128); ctx.lineTo(cx + 14, cy + 150); ctx.lineTo(cx + 6, cy + 50); ctx.fill()
  // rosetón
  ctx.beginPath()
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12
    const rad = i % 2 === 0 ? 104 : 92
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
  }
  ctx.closePath()
  ctx.fillStyle = degradado(ctx, cx - 100, cy - 100, cx + 100, cy + 100)
  ctx.fill()
  ctx.lineWidth = 5; ctx.strokeStyle = '#fff'
  ctx.beginPath(); ctx.arc(cx, cy, 78, 0, Math.PI * 2); ctx.stroke()
  estrella(ctx, cx, cy - 18, 34, 15, '#fde047')
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.font = `800 21px ${SANS}`
  ctx.fillText(etiqueta, cx, cy + 40)
}

/**
 * datos: { nombre, juego, descripcion, estadisticas: [{ valor, etiqueta }], fecha?: Date }
 * Devuelve el <canvas> dibujado.
 */
export function dibujarCertificado(datos) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // fondo
  const fondo = ctx.createLinearGradient(0, 0, W, H)
  fondo.addColorStop(0, '#f0fdff'); fondo.addColorStop(0.5, '#ffffff'); fondo.addColorStop(1, '#fff7ed')
  ctx.fillStyle = fondo
  ctx.fillRect(0, 0, W, H)

  // patrón de ondas tipo billete en el marco
  ctx.save()
  rectRedondeado(ctx, 30, 30, W - 60, H - 60, 36)
  ctx.clip()
  ctx.lineWidth = 2
  for (let k = 0; k < 6; k++) {
    ctx.strokeStyle = degradado(ctx, 0, 0, W, H)
    ctx.globalAlpha = 0.22
    ctx.beginPath()
    for (let x = 30; x <= W - 30; x += 8) ctx.lineTo(x, 70 + k * 7 + Math.sin(x / 26 + k) * 9)
    ctx.stroke()
    ctx.beginPath()
    for (let x = 30; x <= W - 30; x += 8) ctx.lineTo(x, H - 70 - k * 7 + Math.sin(x / 26 + k) * 9)
    ctx.stroke()
  }
  ctx.restore()
  ctx.globalAlpha = 1

  // marcos
  ctx.lineWidth = 16
  ctx.strokeStyle = degradado(ctx, 0, 0, W, H)
  rectRedondeado(ctx, 30, 30, W - 60, H - 60, 36); ctx.stroke()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#7c3aed'
  rectRedondeado(ctx, 62, 62, W - 124, H - 124, 22); ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,.93)'
  rectRedondeado(ctx, 92, 92, W - 184, H - 184, 14); ctx.fill()

  // encabezado
  ctx.fillStyle = '#0891b2'
  ctx.font = `800 26px ${SANS}`
  ctx.letterSpacing = '6px'
  ctx.fillText('JUEGOS DE LÓGICA DE PROGRAMACIÓN', W / 2, 168)
  ctx.letterSpacing = '0px'

  ajustar(ctx, 'Certificado de finalización', (t) => `italic 700 ${t}px ${SERIF}`, W - 400, 98)
  ctx.fillStyle = degradado(ctx, 300, 200, 1300, 300)
  ctx.fillText('Certificado de finalización', W / 2, 290)

  ctx.fillStyle = '#64748b'
  ctx.font = `500 30px ${SANS}`
  ctx.fillText('Este certificado se otorga a', W / 2, 372)

  // nombre
  const nombre = String(datos.nombre || '').trim().slice(0, 40) || 'Jugador'
  ajustar(ctx, nombre, (t) => `700 ${t}px ${SERIF}`, W - 460, 120)
  ctx.fillStyle = '#1e293b'
  ctx.fillText(nombre, W / 2, 490)
  const ancho = Math.min(W - 420, Math.max(480, ctx.measureText(nombre).width + 80))
  ctx.fillStyle = degradado(ctx, W / 2 - ancho / 2, 0, W / 2 + ancho / 2, 0)
  ctx.fillRect(W / 2 - ancho / 2, 515, ancho, 5)

  // juego
  ctx.fillStyle = '#64748b'
  ctx.font = `500 30px ${SANS}`
  ctx.fillText('por completar con éxito', W / 2, 584)
  ajustar(ctx, datos.juego, (t) => `800 ${t}px ${SANS}`, W - 460, 84)
  ctx.fillStyle = '#4f46e5'
  ctx.fillText(datos.juego, W / 2, 670)
  ctx.fillStyle = '#475569'
  ajustar(ctx, datos.descripcion || '', (t) => `500 ${t}px ${SANS}`, W - 460, 28, 20)
  ctx.fillText(datos.descripcion || '', W / 2, 718)

  // estadísticas
  const est = (datos.estadisticas || []).slice(0, 3)
  const cw = 280
  const gap = 24
  const total = est.length * cw + (est.length - 1) * gap
  est.forEach((e, i) => {
    const x = W / 2 - 70 - total / 2 + i * (cw + gap)
    ctx.fillStyle = ['#cffafe', '#ede9fe', '#ffedd5'][i % 3]
    rectRedondeado(ctx, x, 770, cw, 116, 20); ctx.fill()
    ctx.fillStyle = ['#0e7490', '#6d28d9', '#c2410c'][i % 3]
    ajustar(ctx, String(e.valor), (t) => `800 ${t}px ${SANS}`, cw - 30, 52, 28)
    ctx.fillText(String(e.valor), x + cw / 2, 830)
    ctx.font = `600 22px ${SANS}`
    ctx.fillText(e.etiqueta, x + cw / 2, 866)
  })

  // pie
  const fecha = (datos.fecha || new Date()).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  ctx.textAlign = 'left'
  ctx.fillStyle = '#94a3b8'
  ctx.font = `500 22px ${SANS}`
  ctx.fillText('Fecha', 150, 975)
  ctx.fillStyle = '#334155'
  ctx.font = `700 30px ${SERIF}`
  ctx.fillText(fecha, 150, 1015)
  ctx.fillStyle = '#cbd5e1'
  ctx.fillRect(150, 982, 330, 2)
  ctx.textAlign = 'center'

  ctx.fillStyle = '#94a3b8'
  ctx.font = `500 22px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillText('Aprende lógica de programación jugando', W / 2 + 40, 1015)

  sello(ctx, W - 270, 880, '¡LOGRADO!')
  return canvas
}

export const aBlob = (canvas) => new Promise((res) => canvas.toBlob(res, 'image/png'))

const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function nombreArchivo(datos) {
  return `certificado-${slug(datos.juego)}-${slug(datos.nombre) || 'jugador'}.png`
}

export function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

// Abre el menú de compartir del sistema (WhatsApp, redes…) si el navegador lo permite
export async function compartir(blob, datos) {
  const file = new File([blob], nombreArchivo(datos), { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Mi certificado',
        text: `¡Terminé ${datos.juego}! 🎉`,
      })
      return 'compartido'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelado'
    }
  }
  descargar(blob, file.name)
  return 'descargado'
}
