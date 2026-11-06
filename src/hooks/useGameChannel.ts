import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type Player = {
  id: string
  nickname: string
  avatar: string
  score: number
}

export function useGameChannel(gameId: string | null) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) return

    // 1. Cargar los jugadores iniciales (por si ya había algunos)
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('joined_at', { ascending: true })
      
      if (data) setPlayers(data)
      setLoading(false)
    }

    fetchPlayers()

    // 2. Suscribirse a los cambios en tiempo real
    const channel = supabase.channel(`lobby-${gameId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
        (payload) => {
          // Cuando alguien se une, lo agregamos a la lista
          setPlayers((prev) => [...prev, payload.new as Player])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
        (payload) => {
          // Cuando alguien cambia (ej. su puntaje), lo actualizamos
          setPlayers((prev) => 
            prev.map(p => p.id === payload.new.id ? (payload.new as Player) : p)
          )
        }
      )
      .subscribe()

    // 3. Limpiar la conexión cuando salgamos de la pantalla
    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  return { players, loading }
}