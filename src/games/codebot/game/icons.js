import avanzar from '../assets/icons/avanzar.png';
import izquierda from '../assets/icons/izquierda.png';
import derecha from '../assets/icons/derecha.png';
import saltar from '../assets/icons/saltar.png';
import encender from '../assets/icons/encender.png';
import f1 from '../assets/icons/f1.png';
import f2 from '../assets/icons/f2.png';
import repetir from '../assets/icons/repetir.png';
import si from '../assets/icons/si.png';
import ejecutar from '../assets/icons/act_ejecutar.png';
import reiniciar from '../assets/icons/act_reiniciar.png';
import borrar from '../assets/icons/act_borrar.png';

// Bloque -> PNG (glifo blanco; el color de fondo lo pone el bloque)
export const ICONO_BLOQUE = { F: avanzar, L: izquierda, R: derecha, J: saltar, B: encender, P1: f1, P2: f2, REP: repetir, IF: si };
// Acciones: siluetas que se tiñen con el color del texto (CSS mask)
export const ICONO_ACCION = { ejecutar, reiniciar, borrar };
