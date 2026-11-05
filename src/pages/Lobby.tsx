import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameChannel } from '../hooks/useGameChannel'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Cargando sala...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-slate-800">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 w-full max-w-2xl">
        
               <div className="text-center mb-8 border-b border-slate-100 pb-6">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-2">Código de acceso</p>
          <h1 className="text-7xl font-black tracking-widest text-blue-700 my-3 font-mono drop-shadow-sm">
            {gameCode || '...'}
          </h1>
          
          {/* QR MEJORADO */}
          <div className="mt-6 flex flex-col items-center justify-center gap-2">
            <p className="text-sm font-bold text-slate-500">O escanea este código con tu cámara</p>
            <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-slate-100 hover:shadow-xl transition-shadow">
              <QRCodeSVG 
                value={`${window.location.origin}/join`} 
                size={180} 
                level="H"
                includeMargin
              />
            </div>
          </div>
          
          <p className="text-sm text-slate-400 mt-6 font-medium">Comparte este código con tus alumnos</p>
        </div>

        {/* TARJETA DE JUGADORES MEJORADA */}
        <div className="bg-slate-50 rounded-2xl p-6 min-h-[250px] border-2 border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              👥 Jugadores
            </h2>
            <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
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
                <li key={p.id} className="bg-white p-4 rounded-xl flex items-center gap-3 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <span className="text-3xl">{p.avatar || '🧑‍🎓'}</span>
                  <span className="font-bold text-slate-700 truncate">{p.nickname}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isHost && (
          <div className="mt-10 text-center">
            <button 
              onClick={handleStartGame}
              className="bg-blue-700 hover:bg-blue-800 text-white font-black text-xl py-5 px-16 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 w-full md:w-auto"
            >
              Empezar Partida 🚀
            </button>
          </div>
        )}
        
        {!isHost && (
          <p className="text-center text-slate-500 mt-10 animate-pulse font-bold text-lg">
            Esperando a que el profesor inicie la partida...
          </p>
        )}
      </div>
    </div>
  )
}