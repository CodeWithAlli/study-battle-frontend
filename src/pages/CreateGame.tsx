import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generarCodigoSala } from '../lib/utils'
import { generarPreguntas } from '../lib/api'
import { extraerTextoDePDF, extraerTextoDePPTX } from '../lib/extractText'

export default function CreateGame() {
  const [texto, setTexto] = useState('')
  const [numPreguntas, setNumPreguntas] = useState(5)
  const [loading, setLoading] = useState(false)
  const [loadingFile, setLoadingFile] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoadingFile(true)
    setError('')

    try {
      let textoExtraido = ''
      if (file.name.endsWith('.pdf')) {
        textoExtraido = await extraerTextoDePDF(file)
      } else if (file.name.endsWith('.pptx')) {
        textoExtraido = await extraerTextoDePPTX(file)
      } else {
        throw new Error('Formato no soportado. Sube un PDF o PPTX.')
      }
      
      if (textoExtraido.trim().length < 20) {
        throw new Error('El archivo no tiene suficiente texto legible.')
      }

      // Limitamos a 15,000 caracteres para no saturar la IA (aprox 10 páginas)
      setTexto(textoExtraido.slice(0, 15000))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingFile(false)
    }
  }

  const handleCreate = async () => {
    if (texto.trim().length < 20) return setError('El texto debe tener al menos 20 caracteres.')

    setLoading(true)
    setError('')

    try {
      const numSeguro = Math.max(1, Math.min(Number(numPreguntas) || 5, 10));
      const preguntasGeneradas = await generarPreguntas(texto, numSeguro)

      const codigo = generarCodigoSala()
      const { data: game, error: gameError } = await supabase
        .from('games').insert({ code: codigo, status: 'lobby' }).select().single()

      if (gameError) throw gameError

      const preguntasParaInsertar = preguntasGeneradas.map((q, index) => ({
        game_id: game.id,
        question_text: q.question_text,
        options: q.options,
        correct_index: q.correct_index,
        justification: q.justification,
        order_index: index
      }))

      await supabase.from('questions').insert(preguntasParaInsertar)

      localStorage.clear()
      localStorage.setItem('gameId', game.id)
      localStorage.setItem('isHost', 'true')
      localStorage.setItem('playerName', 'Profesor')
      navigate(`/lobby/${game.id}`)

    } catch (err: any) {
      setError(err.message || 'Error al crear la partida.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-2">Crear Partida</h2>
        <p className="text-gray-400 mb-6">Sube tu archivo de clase (PDF o PPTX) o pega el texto.</p>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="flex flex-col gap-4">
          {/* Botón para subir archivo */}
          <div className="bg-gray-900 border border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors relative">
            <input 
              type="file" 
              accept=".pdf,.pptx" 
              onChange={handleFileUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={loadingFile}
            />
            <p className="text-lg font-medium">
              {loadingFile ? '⏳ Extrayendo texto...' : '📄 Haz clic para subir un PDF o PPTX'}
            </p>
            <p className="text-sm text-gray-500 mt-1">O escribe directamente abajo</p>
          </div>

          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="El texto extraído aparecerá aquí. También puedes escribir o pegar texto..."
            rows={8}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 resize-none text-sm"
          />
          
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">Número de preguntas:</label>
            <input 
              type="number" min={1} max={10}
              value={numPreguntas}
              onChange={(e) => setNumPreguntas(Number(e.target.value))}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 w-20 text-center focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button 
            onClick={handleCreate}
            disabled={loading || loadingFile || texto.length < 20}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
          >
            {loading ? '⏳ Generando preguntas...' : 'Generar Preguntas y Crear Sala'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-white text-sm">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}