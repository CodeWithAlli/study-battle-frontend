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

    // Cargar código de sala inicial
    supabase.from('games').select('code, status').eq('id', gameId).single().then(({ data }) => {
      if (data) {
        setGameCode(data.code)
        // Si el alumno recarga la página y el juego ya empezó, lo mandamos a jugar
        if (data.status === 'playing' && !hostStatus) {
          navigate(`/game/${gameId}`)
        }
      }
    })

    // ESCUCHAR EL MOMENTO EN QUE EL PROFE LE DA A EMPEZAR
    const channel = supabase.channel(`lobby-status-${gameId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, 
        (payload) => {
          if (payload.new.status === 'playing' && !hostStatus) {
            navigate(`/game/${gameId}`)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gameId, navigate])

  const handleStartGame = async () => {
    if (players.length === 0) return alert('Necesitas al menos 1 jugador para empezar.')
    
    // Al cambiar el status a 'playing', la app de los alumnos salta sola a Game.tsx
    await supabase.from('games').update({ status: 'playing' }).eq('id', gameId)
    
    navigate(`/game/${gameId}`)
  }

  if (loading) return <div className="p-8 text-center text-white">Cargando lobby...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-700 w-full max-w-2xl">
        
        <div className="text-center mb-8">
          <p className="text-gray-400 text-lg">Código de la sala</p>
          <h1 className="text-6xl font-black font-mono tracking-widest text-emerald-400 my-2">
            {gameCode || '...'}
          </h1>
          <p className="text-sm text-gray-400">Comparte este código con tus alumnos</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 min-h-[200px] border border-gray-700">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-bold">Jugadores conectados</h2>
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold">
              {players.length} en línea
            </span>
          </div>

          {players.length === 0 ? (
            <p className="text-gray-500 text-center mt-8 animate-pulse">Esperando a que se unan...</p>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {players.map((p) => (
                <li key={p.id} className="bg-gray-800 p-3 rounded-lg flex items-center gap-3 border border-gray-700">
                  <span className="text-2xl">{p.avatar || '🧑‍🎓'}</span>
                  <span className="font-bold truncate">{p.nickname}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isHost && (
          <div className="mt-8 text-center">
            <button 
              onClick={handleStartGame}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl py-4 px-12 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 w-full md:w-auto"
            >
              Empezar Partida 🚀
            </button>
          </div>
        )}
        
        {!isHost && (
          <p className="text-center text-gray-400 mt-8 animate-pulse">
            Esperando a que el profesor inicie la partida...
          </p>
        )}
      </div>
    </div>
  )
}