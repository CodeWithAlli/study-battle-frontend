import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameChannel } from '../hooks/useGameChannel'
import { supabase } from '../lib/supabase'

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { players, loading } = useGameChannel(gameId ?? null)
  
  const [isHost, setIsHost] = useState(false)
  const [gameCode, setGameCode] = useState('')

  useEffect(() => {
    const hostStatus = localStorage.getItem('isHost') === 'true'
    setIsHost(hostStatus)

    if (!gameId) return

    supabase.from('games').select('code, status').eq('id', gameId).single().then(({ data }) => {
      if (data) {
        setGameCode(data.code)
        if (data.status === 'playing' && !hostStatus) {
          navigate(`/game/${gameId}`)
        }
      }
    })

    const channel = supabase.channel(`lobby-status-${gameId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, 
        (payload) => {
          if (payload.new.status === 'playing' && !hostStatus) {
            navigate(`/game/${gameId}`)
          }
        }
      ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gameId, navigate])

  const handleStartGame = async () => {
    if (players.length === 0) return alert('Necesitas al menos 1 jugador para empezar.')
    await supabase.from('games').update({ status: 'playing' }).eq('id', gameId)
    navigate(`/game/${gameId}`)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Cargando sala...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-slate-800">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 w-full max-w-2xl">
        
        <div className="text-center mb-8 border-b border-slate-100 pb-6">
          <p className="text-slate-500 font-medium mb-1">Código de la sala</p>
          <h1 className="text-6xl font-black tracking-widest text-blue-700 my-2 font-mono">
            {gameCode || '...'}
          </h1>
          <p className="text-sm text-slate-400">Comparte este código con tus alumnos</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 min-h-[200px] border border-slate-200">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-700">Jugadores conectados</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
              {players.length} en línea
            </span>
          </div>

          {players.length === 0 ? (
            <p className="text-slate-400 text-center mt-12 animate-pulse font-medium">Esperando a que se unan...</p>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {players.map((p) => (
                <li key={p.id} className="bg-white p-3 rounded-lg flex items-center gap-3 border border-slate-200 shadow-sm">
                  <span className="text-2xl">{p.avatar || '🧑‍🎓'}</span>
                  <span className="font-semibold text-slate-700 truncate">{p.nickname}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isHost && (
          <div className="mt-8 text-center">
            <button 
              onClick={handleStartGame}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg py-4 px-12 rounded-xl transition-colors shadow-md w-full md:w-auto"
            >
              Empezar Partida 🚀
            </button>
          </div>
        )}
        
        {!isHost && (
          <p className="text-center text-slate-500 mt-8 animate-pulse font-medium">
            Esperando a que el profesor inicie la partida...
          </p>
        )}
      </div>
    </div>
  )
}