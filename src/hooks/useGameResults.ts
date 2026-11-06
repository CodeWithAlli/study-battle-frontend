import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { calcularExtras, calcularNota } from '../lib/scoring'

export type Resultado = {
  playerId: string
  nickname: string
  aciertos: number
  total: number
  puntaje: number
  vecesX3: number
  esTop1: boolean
  esTop3: boolean
  ganoAudacia: boolean
  todasCorrectas: boolean
  extras: number
  nota_sugerida: number
}

export function useGameResults(gameId: string | null) {
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) return

    const cargarDatos = async () => {
      setLoading(true)

      // 1. Traer todo de Supabase
      const { data: players } = await supabase.from('players').select('*').eq('game_id', gameId)
      const { data: questions } = await supabase.from('questions').select('*').eq('game_id', gameId)
      const { data: answers } = await supabase.from('answers').select('*')

      if (!players || !questions) {
        console.error("No se encontraron jugadores o preguntas")
        setLoading(false)
        return
      }

      const total = questions.length
      const questionIds = questions.map(q => q.id)

      // Filtrar respuestas para que solo sean de esta partida
      const respuestasValidas = (answers || []).filter(a => questionIds.includes(a.question_id))

      // 2. Calcular puntajes
      const rows: Resultado[] = players.map(p => {
        const misRespuestas = respuestasValidas.filter(a => a.player_id === p.id)
        const aciertos = misRespuestas.filter(a => a.is_correct).length
        const vecesX3 = misRespuestas.filter(a => a.multiplier === 3).length

        return {
          playerId: p.id,
          nickname: p.nickname,
          aciertos,
          total,
          puntaje: p.score,
          vecesX3,
          esTop1: false,
          esTop3: false,
          ganoAudacia: false,
          todasCorrectas: aciertos === total && total > 0,
          extras: 0,
          nota_sugerida: 0
        }
      })

      // 3. Calcular Podios
      const ordenDominio = [...rows].sort((a, b) => b.puntaje - a.puntaje)
      ordenDominio.slice(0, 3).forEach((r, i) => {
        const target = rows.find(x => x.playerId === r.playerId)!
        target.esTop3 = true
        if (i === 0) target.esTop1 = true
      })

      const ordenAudacia = [...rows].sort((a, b) => b.vecesX3 - a.vecesX3)
      const topAudaciaIds = ordenAudacia.slice(0, 3).map(r => r.playerId)
      rows.forEach(r => { 
        if (topAudaciaIds.includes(r.playerId) && r.vecesX3 > 0) r.ganoAudacia = true 
      })

      // 4. Calcular Extras y Nota
      rows.forEach(r => {
        r.extras = calcularExtras({
          participo: true,
          esTop1: r.esTop1,
          esTop3: r.esTop3,
          ganoAudacia: r.ganoAudacia,
          todasCorrectas: r.todasCorrectas,
        })
        const notaBase = calcularNota(r.aciertos, total)
        r.nota_sugerida = Math.min(20, notaBase + r.extras)
      })

      setResultados(rows.sort((a, b) => b.puntaje - a.puntaje))
      setLoading(false)
    }

    cargarDatos()
  }, [gameId])

  return { resultados, loading }
}
export async function obtenerRepasoAlumno(gameId: string, playerId: string) {
  // 1. Traer preguntas
  const { data: preguntas } = await supabase
    .from('questions')
    .select('*')
    .eq('game_id', gameId)
    .order('order_index', { ascending: true })
  
  // 2. Traer respuestas del alumno
  const { data: respuestas } = await supabase
    .from('answers')
    .select('*')
    .eq('player_id', playerId)

  if (!preguntas) return []

  // 3. Cruzar datos
  return preguntas.map(p => {
    const resp = respuestas?.find(r => r.question_id === p.id)
    
    return {
      question_text: p.question_text,
      options: p.options,
      correct_index: p.correct_index,
      justification: p.justification,
      // 🔥 AQUÍ ESTÁ LA CORRECCIÓN: Leemos 'selected_option'
      player_answer: resp ? resp.selected_option : null, 
      is_correct: resp ? resp.is_correct : false
    }
  })
}