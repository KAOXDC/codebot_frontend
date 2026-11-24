// Una solución de referencia en Python para cada nivel (usa la estructura que pide el nivel).
// Sirve para las pruebas automáticas (deben ganar bronce y plata) y para que el docente
// compare con lo que escriben los estudiantes.

export const REFERENCE = [
  'derecha()\nderecha()\nderecha()\n',
  'abajo()\nfor i in range(5):\n    derecha()\narriba()\n',
  'pasos = 4\nfor i in range(pasos):\n    derecha()\nderecha()\n',
  'pasos = 3\nfor i in range(pasos):\n    derecha()\npasos = pasos + 2\nfor i in range(pasos):\n    derecha()\n',
  'if hay_enemigo("derecha"):\n    atacar()\nfor i in range(5):\n    derecha()\n',
  'for i in range(12):\n    if hay_enemigo("derecha"):\n        atacar()\n    else:\n        derecha()\n',
  'derecha()\nif hay_enemigo("derecha"):\n    atacar()\nderecha()\nabajo()\natacar()\nfor i in range(2):\n    derecha()\narriba()\nfor i in range(3):\n    derecha()\n',
  'derecha()\nif hay_enemigo("derecha"):\n    atacar()\nfor i in range(3):\n    derecha()\nabajo()\natacar()\nfor i in range(4):\n    derecha()\n',
  'for i in range(11):\n    derecha()\n',
  'derecha()\nfor i in range(3):\n    atacar()\n    for j in range(3):\n        derecha()\nderecha()\n',
  'for i in range(4):\n    derecha()\nfor i in range(2):\n    abajo()\nfor i in range(4):\n    izquierda()\n',
  'while not hay_muro("derecha"):\n    derecha()\n',
  'while hay_enemigo("derecha"):\n    atacar()\nfor i in range(5):\n    derecha()\n',
  'while True:\n    atacar()\n    if not hay_enemigo("derecha"):\n        break\nfor i in range(4):\n    derecha()\n',
  'def golpear():\n    atacar()\n    derecha()\nfor i in range(12):\n    if hay_enemigo("derecha"):\n        golpear()\n    else:\n        derecha()\n',
  'def avanzar(n):\n    for i in range(n):\n        derecha()\navanzar(6)\natacar()\navanzar(7)\n',
  'def doble(n):\n    return n * 2\nfor i in range(doble(5)):\n    derecha()\n',
  'derecha()\natacar()\nfor i in range(3):\n    derecha()\nabajo()\natacar()\nfor i in range(4):\n    derecha()\natacar()\nderecha()\n',
  'def avanzar(n):\n    for i in range(n):\n        derecha()\nabajo()\nabajo()\navanzar(3)\natacar()\narriba()\narriba()\navanzar(2)\natacar()\navanzar(5)\n',
  'def pegar():\n    if hay_enemigo("derecha") or hay_enemigo("izquierda"):\n        atacar()\nderecha()\nderecha()\npegar()\nfor i in range(3):\n    derecha()\nfor i in range(2):\n    abajo()\nfor i in range(3):\n    derecha()\nfor i in range(2):\n    arriba()\npegar()\nfor i in range(4):\n    derecha()\nfor i in range(2):\n    abajo()\npegar()\nfor i in range(2):\n    abajo()\nfor i in range(12):\n    izquierda()\nfor i in range(2):\n    arriba()\npegar()\n',
]
