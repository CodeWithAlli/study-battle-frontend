import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generarCodigoSala } from '../lib/utils'
import { generarPreguntas } from '../lib/api'

export default function CreateGame() {
  const [texto, setTexto] = useState('')
  const [numPreguntas, setNumPreguntas] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleCreate = async () => {
    if (texto.trim().length < 20) {
      return setError('El texto debe tener al menos 20 caracteres.')
    }

    setLoading(true)
    setError('')

    try {
      // 1. Generar las preguntas llamando al backend en Render
      // (La primera vez puede tardar unos segundos si el servidor está dormido)
      const preguntasGeneradas = await generarPreguntas(texto, numPreguntas)

      // 2. Crear la partida en Supabase
      const codigo = generarCodigoSala()
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({ code: codigo, status: 'lobby' })
        .select()
        .single()

      if (gameError) throw gameError

      // 3. Guardar las preguntas en Supabase
      const preguntasParaInsertar = preguntasGeneradas.map((q, index) => ({
        game_id: game.id,
        question_text: q.question_text,
        options: q.options,
        correct_index: q.correct_index,
        justification: q.justification,
        order_index: index
      }))

      const { error: preguntasError } = await supabase
        .from('questions')
        .insert(preguntasParaInsertar)

      if (preguntasError) throw preguntasError

      // 4. Guardar en LocalStorage y navegar al lobby
      localStorage.setItem('gameId', game.id)
      localStorage.setItem('isHost', 'true')
      localStorage.setItem('playerName', 'Profesor');
      navigate(`/lobby/${game.id}`)

    } catch (err: any) {
      setError(err.message || 'Error al crear la partida. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-2">Crear Partida</h2>
        <p className="text-gray-400 mb-6">Pega el texto de estudio. La IA generará las preguntas automáticamente.</p>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="flex flex-col gap-4">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej: La Revolución Francesa comenzó en 1789. Los ciudadanos tomaron la Bastilla..."
            rows={6}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 resize-none"
          />
          
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">Número de preguntas:</label>
            <input 
              type="number" 
              min={1} max={10}
              value={numPreguntas}
              onChange={(e) => setNumPreguntas(Number(e.target.value))}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 w-20 text-center focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button 
            onClick={handleCreate}
            disabled={loading || texto.length < 20}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Generando preguntas y sala...
              </>
            ) : (
              'Generar Preguntas y Crear Sala'
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-white text-sm">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}