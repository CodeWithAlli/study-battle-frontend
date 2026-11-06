import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, User, Grid3X3, Play, Target, Users } from 'lucide-react'

export default function JoinGame() {
  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCodeLocked, setIsCodeLocked] = useState(false)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode) {
      setCode(urlCode.toUpperCase())
      setIsCodeLocked(true)
    }
  }, [searchParams])

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
      
      {/* Cabecera con flecha para volver y el logo */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <Link to="/" className="p-2 bg-slate-800/60 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="w-8 h-8 object-contain" alt="logo"/>
          <span className="font-bold text-xl">Study<span className="text-purple-500">Battle</span></span>
        </div>
        <div className="w-10"></div> {/* Espaciador para centrar el logo */}
      </div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-purple-500/30 relative">
        
        {/* Título y Diana */}
        <div className="flex items-center justify-center gap-3 mb-8 relative">
          <Users className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-extrabold text-white">Unirse a Partida</h2>
          <Target className="w-10 h-10 text-pink-500 absolute -right-2 -top-4 opacity-80" />
        </div>
        
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-xl mb-6 text-sm border border-red-500/30 text-center font-medium">{error}</div>}

        <form onSubmit={handleJoin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 flex justify-between">
              <span>Código de la sala</span>
              {isCodeLocked && <span className="text-purple-400 text-xs flex items-center gap-1">✓ Escaneado</span>}
            </label>
            <div className="relative">
              <Grid3X3 className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123" 
                maxLength={6} 
                required
                disabled={isCodeLocked}
                className={`w-full border-2 rounded-xl pl-12 pr-4 py-4 text-3xl font-mono tracking-widest focus:outline-none transition-all ${
                  isCodeLocked 
                    ? 'bg-slate-800/80 border-purple-500/20 text-slate-500 cursor-not-allowed' 
                    : 'bg-slate-800/50 border-purple-500/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50' 
                }`}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Tu nombre</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej: María" 
                required
                className="w-full bg-slate-800/50 border-2 border-purple-500/30 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? 'Entrando...' : <><Play className="w-5 h-5"/> Entrar a la sala</>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className="text-slate-400 hover:text-purple-400 text-sm font-bold transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4"/> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}