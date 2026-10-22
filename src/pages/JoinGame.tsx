import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function JoinGame() {
  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Buscar la partida por el código
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (gameError || !game) throw new Error('No se encontró ninguna partida con ese código.')
      if (game.status !== 'lobby') throw new Error('La partida ya ha comenzado o terminado.')

      // 2. Crear el jugador
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          game_id: game.id,
          nickname: nickname,
          avatar: '🧑‍🎓' // Avatar temporal por defecto
        })
        .select()
        .single()

      if (playerError) {
        if (playerError.code === '23505') throw new Error('Ese nombre ya está en uso en esta sala.')
        throw playerError
      }

      // 3. Guardar el ID del jugador en el navegador (LocalStorage)
      localStorage.clear(); // <-- Limpiamos todo
      localStorage.setItem('playerId', player.id);
      localStorage.setItem('gameId', game.id);
      localStorage.setItem('playerName', player.nickname);
      // Al no poner isHost, se asume que es alumno

      // 4. Ir a la sala de espera (Lobby)
      navigate(`/lobby/${game.id}`)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center">Unirse a Partida</h2>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Código de la sala</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
              maxLength={6}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tu nombre</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ej: María"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-bold py-3 rounded-xl transition-all"
          >
            {loading ? 'Entrando...' : 'Entrar a la sala'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-white text-sm">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}