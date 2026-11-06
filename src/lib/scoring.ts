export const PUNTOS = {
  1: { acierto: +100, fallo: -50  },
  2: { acierto: +200, fallo: -100 },
  3: { acierto: +300, fallo: -200 },
} as const

export type Multiplicador = 1 | 2 | 3

export function calcularDelta(mult: Multiplicador, esCorrecta: boolean): number {
  return esCorrecta ? PUNTOS[mult].acierto : PUNTOS[mult].fallo
}

export function calcularNota(aciertos: number, total: number): number {
  if (total === 0) return 0
  return Math.round((aciertos / total) * 20) // entero, sin .00
}

export function calcularExtras(opts: {
  participo: boolean
  esTop1: boolean
  esTop3: boolean
  ganoAudacia: boolean
  todasCorrectas: boolean
}): number {
  let extras = 0
  if (opts.participo) extras += 1
  if (opts.esTop3 && !opts.esTop1) extras += 1
  if (opts.esTop1) extras += 2
  if (opts.ganoAudacia) extras += 1
  if (opts.todasCorrectas) extras += 1
  return Math.min(extras, 4) // tope +4 por sesión
}