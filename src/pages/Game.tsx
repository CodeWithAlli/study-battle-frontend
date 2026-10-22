import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcularDelta, type Multiplicador } from '../lib/scoring'
import { MultiplierButtons } from '../components/MultiplierButtons'
import { OptionButton } from '../components/OptionButton'
import { Timer } from '../components/Timer'

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
        // Solo reiniciamos si el índice de la pregunta cambió
        if (payload.new.current_question_index !== currentIndex) {
          setCurrentIndex(payload.new.current_question_index)
          
          // Forzamos el reinicio a 20 segundos
          setTimerSeconds(20)
          setTimeLeft(20) 
          
          // Limpiamos estados para la nueva pregunta
          setMultiplier(null)
          setSelectedOption(null)
          setIsRevealed(false)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gameId, currentIndex])

  const preguntaActual = preguntas[currentIndex]

  // Lógica del contador (corre para todos, pero se detiene al revelar)
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
    setIsRevealed(true) // Se revela para el alumno en el momento que responde

    if (isHost || !playerId) return 

    const esCorrecta = index === preguntaActual.correct_index
    const delta = calcularDelta(multiplier, esCorrecta)

    await supabase.from('answers').insert({
      player_id: playerId,
      question_id: preguntaActual.id,
      multiplier: multiplier,
      is_correct: esCorrecta,
      delta: delta
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
        question_started_at: new Date().toISOString() // 🔥 Guardamos la hora
      }).eq('id', gameId)
    } else {
      await supabase.from('games').update({ status: 'finished' }).eq('id', gameId)
      navigate(`/results/${gameId}`)
    }
  }

  if (loading) return <div className="p-8 text-center text-white">Cargando juego...</div>
  if (!preguntaActual) return <div className="p-8 text-center text-white">Esperando preguntas...</div>

    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-3xl">
        
        <div className="flex justify-between items-center mb-2 bg-gray-800 p-4 rounded-t-xl border border-gray-700">
          <span className="font-bold text-lg">Pregunta {currentIndex + 1} de {preguntas.length}</span>
          <span className={`px-4 py-1 rounded-lg text-sm font-bold ${isHost ? 'bg-purple-600' : 'bg-cyan-600'}`}>
            {playerName} {isHost ? '(Profesor)' : '(Alumno)'}
          </span>
        </div>

        {/* TEMPORIZADOR: Barra + Número exacto para ambos */}
        <div className="mt-4 mb-2 flex items-center gap-4">
          <div className="flex-1 bg-gray-900 rounded-full h-4 overflow-hidden border border-gray-700">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${timeLeft > 10 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-orange-500' : 'bg-red-500'}`}
              style={{ width: `${(timeLeft / timerSeconds) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xl font-bold w-10 text-right">
            {timeLeft}s
          </span>
        </div>

        <div className="bg-gray-800 p-8 rounded-b-2xl shadow-2xl border-x border-b border-gray-700 mb-6">
          <h2 className="text-3xl font-bold mb-8 text-center">{preguntaActual.question_text}</h2>

          {/* VISTA DEL ALUMNO */}
          {!isHost && (
            <>
              {/* 1. Elegir multiplicador (x1, x2, x3) */}
              {!multiplier && !isRevealed && (
                <div>
                  <p className="text-center text-gray-400 mb-2 animate-pulse">Elige tu nivel de riesgo:</p>
                  <MultiplierButtons onSelect={handleSelectMultiplier} disabled={false} />
                </div>
              )}

              {/* 2. Elegir respuesta */}
              {multiplier && !isRevealed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preguntaActual.options.map((opt, i) => (
                    <OptionButton 
                      key={i} 
                      text={opt} 
                      index={i} 
                      selected={selectedOption === i} 
                      onClick={() => handleSelectOption(i)} 
                      disabled={selectedOption !== null} 
                    />
                  ))}
                </div>
              )}

              {/* 3. Revelación */}
              {isRevealed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preguntaActual.options.map((opt, i) => (
                    <OptionButton 
                      key={i} 
                      text={opt} 
                      index={i} 
                      selected={selectedOption === i} 
                      onClick={() => {}} 
                      disabled={true} 
                      correctIndex={preguntaActual.correct_index} 
                      revealed={true} 
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
                  key={i} 
                  text={opt} 
                  index={i} 
                  selected={false} 
                  onClick={() => {}} 
                  disabled={true} 
                  correctIndex={preguntaActual.correct_index} 
                  revealed={isRevealed} 
                />
              ))}
            </div>
          )}
        </div>

        {/* BOTÓN DE SIGUIENTE (Solo profe) */}
        {isHost && isRevealed && (
          <div className="text-center animate-fade-in">
            <button 
              onClick={handleNextQuestion} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-12 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30"
            >
              {currentIndex < preguntas.length - 1 ? 'Siguiente Pregunta ➡️' : 'Ver Resultados 🏆'}
            </button>
          </div>
        )}

        {/* MENSAJE PARA EL ALUMNO */}
        {!isHost && isRevealed && (
          <p className="text-center text-gray-400 mt-4 animate-pulse">
            Esperando a que el profesor pase a la siguiente...
          </p>
        )}

      </div>
    </div>
  )
}