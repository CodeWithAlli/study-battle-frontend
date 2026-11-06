import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcularDelta, type Multiplicador } from '../lib/scoring'
import { MultiplierButtons } from '../components/MultiplierButtons'
import { OptionButton } from '../components/OptionButton'
import { GraduationCap, Trophy, BarChart3, HelpCircle, UserCircle2, Timer } from 'lucide-react'

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

  // 🔥 ESTADO PARA LA IMAGEN LATERAL
  const [randomImage, setRandomImage] = useState('')

  const isHost = localStorage.getItem('isHost') === 'true'
  const playerId = localStorage.getItem('playerId')
  const playerName = localStorage.getItem('playerName') || (isHost ? 'Profesor' : 'Alumno')

  // Función para cambiar la imagen lateral
  const elegirImagenAleatoria = () => {
    // Asumiendo que tienes 10 imágenes en public/preguntas (1.png a 10.png)
    const numImagen = Math.floor(Math.random() * 10) + 1; 
    setRandomImage(`/preguntas/${numImagen}.png`);
  }

  useEffect(() => {
    // Elegimos la primera imagen al cargar
    elegirImagenAleatoria()

    const fetchGameData = async () => {
      const { data: qs } = await supabase
        .from('questions').select('*').eq('game_id', gameId).order('order_index', { ascending: true })
      if (qs) setPreguntas(qs)

      const { data: g } = await supabase.from('games').select('current_question_index, timer_seconds').eq('id', gameId).single()
      if (g) {
        setCurrentIndex(g.current_question_index)
        // 🔥 FIX: Si el temporizador viene en 0, forzamos 20
        setTimerSeconds(g.timer_seconds || 20) 
        setTimeLeft(g.timer_seconds || 20)
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
          
          // 🔥 CAMBIA LA IMAGEN LATERAL AL AVANZAR
          elegirImagenAleatoria()
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
    <div className="flex flex-col min-h-screen bg-transparent text-white overflow-hidden relative">
      
      {/* HEADER DE NAVEGACIÓN */}
      <nav className="flex items-center justify-between px-6 py-3 bg-slate-900/40 border-b border-purple-500/20 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-8 h-8 object-cover rounded-full border border-purple-500" alt="logo"/>
          <span className="font-extrabold text-xl text-white">Study<span className="text-purple-500">Battle</span></span>
        </div>
        <div className="flex items-center gap-6 text-sm font-bold text-slate-300">
          <span className="flex items-center gap-1 hover:text-purple-400"><GraduationCap className="w-4 h-4"/> Inicio</span>
          <span className="flex items-center gap-1 hover:text-purple-400"><Trophy className="w-4 h-4"/> Retos</span>
          <span className="flex items-center gap-1 hover:text-purple-400"><BarChart3 className="w-4 h-4"/> Ranking</span>
          <span className="flex items-center gap-1 hover:text-purple-400"><HelpCircle className="w-4 h-4"/> Cómo funciona</span>
        </div>
      </nav>

      {/* 🔥 CONTENEDOR PRINCIPAL (3 Columnas) */}
      <div className="flex-1 flex flex-row items-center justify-center p-4 lg:p-8 gap-4 lg:gap-8 z-10 w-full max-w-[1600px] mx-auto">
        
        {/* COLUMNA IZQUIERDA: Imagen lateral */}
        <div className="hidden lg:flex w-[20%] h-full justify-center items-center relative">
           <div className="absolute inset-0 bg-purple-600/20 blur-[100px] rounded-full w-[80%] h-[80%] m-auto"></div>
           <img 
              src={randomImage} 
              alt="Personaje" 
              className="w-full max-h-[70vh] object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.6)] relative z-10" 
           />
        </div>

        {/* COLUMNA CENTRAL: Juego */}
        <div className="w-full lg:w-[60%] max-w-4xl flex flex-col items-center justify-center">
          
          {/* Barra superior (Pregunta, tiempo) */}
          <div className="w-full flex flex-wrap justify-between items-center mb-4 bg-slate-900/60 backdrop-blur-md px-4 py-3 rounded-xl border border-purple-500/30 gap-2">
            <span className="font-bold text-slate-300 text-sm md:text-base">Pregunta {currentIndex + 1} de {preguntas.length}</span>
            
            <div className="flex-1 max-w-[200px] md:max-w-md mx-2 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft > 10 ? 'bg-purple-500' : timeLeft > 5 ? 'bg-orange-500' : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${(timeLeft / timerSeconds) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-600 text-sm">
              <UserCircle2 className="w-4 h-4 text-purple-400" />
              <span className="font-bold">{playerName}</span>
            </div>
            
            <div className={`flex items-center gap-1 font-mono font-bold text-lg ml-2 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
               <Timer className="w-5 h-5" /> {timeLeft}s
            </div>
          </div>

          {/* Tarjeta de Pregunta */}
          <div className="w-full bg-slate-900/80 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.15)] border border-purple-500/40 relative">
            
            <h2 className="text-xl md:text-3xl font-bold mb-8 text-center text-white leading-relaxed">
              {preguntaActual.question_text}
            </h2>

            {/* VISTA DEL ALUMNO */}
            {!isHost && (
              <>
                {!multiplier && !isRevealed && (
                  <div>
                    <p className="text-center text-purple-300 mb-4 font-bold text-sm">Elige tu nivel de riesgo:</p>
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

            {/* Botón Siguiente (Profesor) */}
            {isHost && isRevealed && (
              <div className="mt-10 text-center animate-fade-in">
                <button onClick={handleNextQuestion} className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold py-3 px-12 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.5)] text-lg">
                  {currentIndex < preguntas.length - 1 ? 'Siguiente Pregunta ➡️' : 'Ver Resultados 🏆'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Imagen lateral (Puedes usar otra imagen o la misma) */}
        <div className="hidden lg:flex w-[20%] h-full justify-center items-center relative">
           <div className="absolute inset-0 bg-purple-600/20 blur-[100px] rounded-full w-[80%] h-[80%] m-auto"></div>
           <img 
              src={randomImage} // Si quieres una imagen distinta a la izquierda, cambia esto por otra ruta
              alt="Personaje" 
              className="w-full max-h-[70vh] object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.6)] relative z-10 transform scale-x-[-1]" 
           />
        </div>

      </div>

      {/* Mensaje Alumno (Cuando espera al profe) */}
      {!isHost && isRevealed && (
        <div className="absolute bottom-4 left-0 w-full text-center z-20">
          <p className="text-purple-300 font-bold animate-pulse text-lg bg-slate-900/80 inline-block px-6 py-2 rounded-full border border-purple-500/30">
            Esperando a que el profesor pase a la siguiente...
          </p>
        </div>
      )}

    </div>
  )
}