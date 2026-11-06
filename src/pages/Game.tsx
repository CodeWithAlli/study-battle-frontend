import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcularDelta, type Multiplicador } from '../lib/scoring'
import { MultiplierButtons } from '../components/MultiplierButtons'
import { OptionButton } from '../components/OptionButton'

type Question = {
  id: string
  question_text: string
  options: string[]
  correct_index: number
  justification: string
  order_index: number
}

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const [preguntas, setPreguntas] = useState<Question[]>([])
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(20)
  const [timeLeft, setTimeLeft] = useState(20)
  
  const [multiplier, setMultiplier] = useState<Multiplicador | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [loading, setLoading] = useState(true)

  const isHost = localStorage.getItem('isHost') === 'true'
  const playerId = localStorage.getItem('playerId')
  const playerName = localStorage.getItem('playerName') || (isHost ? 'Profesor' : 'Alumno')

  useEffect(() => {
    const fetchGameData = async () => {
      const { data: qs } = await supabase
        .from('questions').select('*').eq('game_id', gameId).order('order_index', { ascending: true })
      if (qs) setPreguntas(qs)

      const { data: g } = await supabase.from('games').select('current_question_index, timer_seconds').eq('id', gameId).single()
      if (g) {
        setCurrentIndex(g.current_question_index)
        setTimerSeconds(g.timer_seconds)
        setTimeLeft(g.timer_seconds)
      }
      setLoading(false)
    }
    fetchGameData()

    const channel = supabase.channel(`game-${gameId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, (payload) => {
        
        if (payload.new.status === 'finished' && !isHost) {
          navigate(`/results/${gameId}`)
          return
        }

        if (payload.new.current_question_index !== currentIndex) {
          setCurrentIndex(payload.new.current_question_index)
          setTimerSeconds(20)
          setTimeLeft(20) 
          setMultiplier(null)
          setSelectedOption(null)
          setIsRevealed(false)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gameId, currentIndex, isHost, navigate])

  const preguntaActual = preguntas[currentIndex]

  useEffect(() => {
    if (isRevealed || !preguntaActual) return
    if (timeLeft <= 0) {
      setIsRevealed(true) 
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, isRevealed, preguntaActual])

  const handleSelectMultiplier = (mult: Multiplicador) => {
    setMultiplier(mult)
  }

  const handleSelectOption = async (index: number) => {
    if (!multiplier) return alert('Primero elige un multiplicador (x1, x2 o x3)')
    setSelectedOption(index)
    setIsRevealed(true) 

    if (isHost || !playerId) return 

    const esCorrecta = index === preguntaActual.correct_index
    const delta = calcularDelta(multiplier, esCorrecta)

    await supabase.from('answers').insert({
      player_id: playerId,
      question_id: preguntaActual.id,
      multiplier: multiplier,
      is_correct: esCorrecta,
      delta: delta,
      selected_option: index 
    })

    const { data: player } = await supabase.from('players').select('score').eq('id', playerId).single()
    if (player) {
      await supabase.from('players').update({ score: player.score + delta }).eq('id', playerId)
    }
  }

  const handleNextQuestion = async () => {
    if (currentIndex < preguntas.length - 1) {
      await supabase.from('games').update({ 
        current_question_index: currentIndex + 1,
        question_started_at: new Date().toISOString()
      }).eq('id', gameId)
    } else {
      await supabase.from('games').update({ status: 'finished' }).eq('id', gameId)
      navigate(`/results/${gameId}`)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-400 font-bold text-xl">Cargando preguntas...</div>
  if (!preguntaActual) return <div className="min-h-screen flex items-center justify-center text-purple-400 font-bold text-xl">Esperando preguntas...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
      <div className="w-full max-w-3xl">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-2 bg-slate-900/80 p-4 rounded-t-2xl border border-purple-500/30 shadow-lg backdrop-blur-sm">
          <span className="font-bold text-slate-300">Pregunta {currentIndex + 1} de {preguntas.length}</span>
          <span className={`px-4 py-1 rounded-lg text-sm font-bold ${isHost ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
            {playerName} {isHost ? '(Profesor)' : '(Alumno)'}
          </span>
        </div>

        {/* Barra de Tiempo */}
        <div className="mb-6 flex items-center gap-4 bg-slate-900/80 px-4 py-3 border-x border-purple-500/30">
          <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700 shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft > 10 
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' 
                  : timeLeft > 5 
                    ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' 
                    : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse'
              }`}
              style={{ width: `${(timeLeft / timerSeconds) * 100}%` }}
            />
          </div>
          <span className={`font-mono text-xl font-black w-12 text-right ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Tarjeta de Pregunta */}
        <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-b-2xl shadow-2xl border-x border-b border-purple-500/30 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-white drop-shadow-md">{preguntaActual.question_text}</h2>

          {/* VISTA DEL ALUMNO */}
          {!isHost && (
            <>
              {!multiplier && !isRevealed && (
                <div>
                  <p className="text-center text-purple-300 mb-4 font-bold text-lg">Elige tu nivel de riesgo:</p>
                  <MultiplierButtons onSelect={handleSelectMultiplier} disabled={false} />
                </div>
              )}

              {multiplier && !isRevealed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preguntaActual.options.map((opt, i) => (
                    <OptionButton 
                      key={i} text={opt} index={i} selected={selectedOption === i} 
                      onClick={() => handleSelectOption(i)} disabled={selectedOption !== null} 
                    />
                  ))}
                </div>
              )}

              {isRevealed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preguntaActual.options.map((opt, i) => (
                    <OptionButton 
                      key={i} text={opt} index={i} selected={selectedOption === i} 
                      onClick={() => {}} disabled={true} correctIndex={preguntaActual.correct_index} revealed={true} 
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* VISTA DEL PROFE */}
          {isHost && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preguntaActual.options.map((opt, i) => (
                <OptionButton 
                  key={i} text={opt} index={i} selected={false} onClick={() => {}} disabled={true} 
                  correctIndex={preguntaActual.correct_index} revealed={isRevealed} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Botón Siguiente (Profesor) */}
        {isHost && isRevealed && (
          <div className="text-center animate-fade-in mt-6">
            <button onClick={handleNextQuestion} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg py-4 px-12 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]">
              {currentIndex < preguntas.length - 1 ? 'Siguiente Pregunta ➡️' : 'Ver Resultados 🏆'}
            </button>
          </div>
        )}

        {/* Mensaje Alumno */}
        {!isHost && isRevealed && (
          <p className="text-center text-purple-300 font-bold mt-6 animate-pulse text-lg">
            Esperando a que el profesor pase a la siguiente...
          </p>
        )}
      </div>
    </div>
  )
}