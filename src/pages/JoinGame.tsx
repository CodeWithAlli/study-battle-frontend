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
      const { data: game, error: gameError } = await supabase
        .from('games').select('*').eq('code', code.toUpperCase()).single()

      if (gameError || !game) throw new Error('No se encontró ninguna partida con ese código.')
      if (game.status !== 'lobby') throw new Error('La partida ya ha comenzado o terminado.')

      const { data: player, error: playerError } = await supabase
        .from('players').insert({ game_id: game.id, nickname: nickname, avatar: '🧑‍🎓' })
        .select().single()

      if (playerError) {
        if (playerError.code === '23505') throw new Error('Ese nombre ya está en uso en esta sala.')
        throw playerError
      }

      localStorage.clear() 
      localStorage.setItem('playerId', player.id)
      localStorage.setItem('gameId', game.id)
      localStorage.setItem('playerName', player.nickname)

      navigate(`/lobby/${game.id}`)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-slate-800">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-slate-900">Unirse a Partida</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200 text-center">{error}</div>}

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Código de la sala</label>
            <input 
              type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123" maxLength={6} required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Tu nombre</label>
            <input 
              type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
              placeholder="Ej: María" required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-slate-800"
            />
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="mt-4 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
          >
            {loading ? 'Entrando...' : 'Entrar a la sala'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-slate-500 hover:text-blue-700 text-sm font-medium transition-colors">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}