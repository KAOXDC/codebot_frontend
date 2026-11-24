export const contarBloques = (prog) => prog.main.length + prog.f1.length + prog.f2.length;

// Base 100 + rapidez (hasta 50) + pocos intentos (hasta 30) + pocos bloques (hasta 20) = máx. 200
export function puntuarNivel(level, segundos, bloquesUsados, intentos) {
  const base = 100;
  const rapidez = Math.round(50 * Math.max(0, 1 - segundos / level.tp));
  const pocosIntentos = Math.max(0, 30 - (intentos - 1) * 10);
  const pocosBloques = bloquesUsados <= level.par ? 20 : Math.max(0, 20 - (bloquesUsados - level.par) * 5);
  const total = base + rapidez + pocosIntentos + pocosBloques;
  const estrellas = total >= 170 ? 3 : total >= 130 ? 2 : 1;
  return {
    base,
    rapidez,
    intentos: pocosIntentos,
    bloques: pocosBloques,
    total,
    estrellas,
    segundos: Math.round(segundos),
    bloquesUsados,
  };
}
