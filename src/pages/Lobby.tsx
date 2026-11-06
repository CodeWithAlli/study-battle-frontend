import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameChannel } from '../hooks/useGameChannel'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Users, Play, AlertCircle } from 'lucide-react'

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { players, loading } = useGameChannel(gameId ?? null)
  
  const [isHost, setIsHost] = useState(false)
  const [gameCode, setGameCode] = useState('')
  const [startError, setStartError] = useState('')

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
    if (players.length === 0) {
      setStartError('Necesitas al menos 1 jugador para empezar la partida.')
      return
    }
    setStartError('')
    await supabase.from('games').update({ status: 'playing' }).eq('id', gameId)
    navigate(`/game/${gameId}`)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-400 font-bold text-xl">Cargando sala...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white relative">
      
      {/* Botón Volver (Esquina superior izquierda, opcional para el profe) */}
      <div className="absolute top-6 left-6">
        <button onClick={() => navigate('/')} className="p-2 bg-slate-800/60 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Salir
        </button>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl border border-purple-500/30 w-full max-w-2xl relative z-10">
        
        <div className="text-center mb-8 border-b border-purple-500/20 pb-8">
          <p className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-2">Código de acceso</p>
          <h1 className="text-7xl font-black tracking-widest text-white my-3 font-mono drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            {gameCode || '...'}
          </h1>
          
          <div className="mt-6 flex flex-col items-center justify-center gap-2">
            <p className="text-sm font-bold text-slate-300">O escanea este código con tu cámara</p>
            <div className="p-3 bg-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <QRCodeSVG 
                value={`${window.location.origin}/join?code=${gameCode}`} 
                size={160} 
                level="H"
                includeMargin
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 rounded-2xl p-6 min-h-[200px] border border-purple-500/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400"/> Jugadores
            </h2>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-4 py-1.5 rounded-full text-sm font-bold">
              {players.length} en línea
            </span>
          </div>

          {players.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400 animate-pulse">
              <span className="text-4xl mb-2">⏳</span>
              <p className="font-bold text-lg">Esperando a que se unan...</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {players.map((p) => (
                <li key={p.id} className="bg-slate-800/80 p-4 rounded-xl flex items-center gap-3 border border-purple-500/20 shadow-sm hover:border-purple-500/50 transition-colors">
                  <span className="text-3xl">{p.avatar || '🧑‍🎓'}</span>
                  <span className="font-bold text-slate-200 truncate">{p.nickname}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 🔥 MENSAJE DE ERROR ELEGANTE (Reemplaza al alert) */}
        {startError && (
          <div className="mt-6 bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/30 text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
            <AlertCircle className="w-5 h-5" /> {startError}
          </div>
        )}

        {isHost && (
          <div className="mt-8 text-center flex flex-col items-center gap-4">
            <button 
              onClick={handleStartGame}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xl py-5 px-16 rounded-2xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] w-full md:w-auto transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6 fill-white" /> Empezar Partida 🚀
            </button>
          </div>
        )}
        
        {!isHost && (
          <p className="text-center text-purple-300 mt-8 animate-pulse font-bold text-lg">
            Esperando a que el profesor inicie la partida...
          </p>
        )}
      </div>
    </div>
  )
}