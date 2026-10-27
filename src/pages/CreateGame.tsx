import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generarCodigoSala } from '../lib/utils'
import { generarPreguntas } from '../lib/api'
import { extraerTextoDePDF ,extraerContenidoDePPTX} from '../lib/extractText'

export default function CreateGame() {
  const [texto, setTexto] = useState('')
  const [imagenes, setImagenes] = useState<string[]>([])
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
      let imagenesExtraidas: string[] = []

      if (file.name.endsWith('.pdf')) {
        textoExtraido = await extraerTextoDePDF(file)
      } else if (file.name.endsWith('.pptx')) {
        const result = await extraerContenidoDePPTX(file)
        textoExtraido = result.texto
        imagenesExtraidas = result.imagenes
      } else {
        throw new Error('Formato no soportado. Sube un PDF o PPTX.')
      }
      
      if (textoExtraido.trim().length < 20 && imagenesExtraidas.length === 0) {
        throw new Error('El archivo no tiene suficiente texto ni imágenes.')
      }

      setTexto(textoExtraido.slice(0, 10000)) // Recortamos texto para dar espacio a las imágenes
      setImagenes(imagenesExtraidas)
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
      const preguntasGeneradas = await generarPreguntas(texto, numSeguro, imagenes)

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-slate-800">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-3xl font-bold mb-2 text-slate-900">Crear Partida</h2>
        <p className="text-slate-500 mb-6">Sube tu archivo de clase (PDF o PPTX) o pega el texto.</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}

        <div className="flex flex-col gap-4">
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors relative cursor-pointer">
            <input
              type="file" accept=".pdf,.pptx" onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loadingFile}
            />
            <p className="text-lg font-medium text-slate-700">
              {loadingFile ? '⏳ Extrayendo texto...' : '📄 Haz clic para subir un PDF o PPTX'}
            </p>
            <p className="text-sm text-slate-400 mt-1">O escribe directamente abajo</p>
          </div>

          <textarea
            value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="El texto extraído aparecerá aquí. También puedes escribir o pegar texto..."
            rows={8}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-sm text-slate-700"
          />

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-600">Número de preguntas:</label>
            <input
              type="number" min={1} max={10} value={numPreguntas}
              onChange={(e) => setNumPreguntas(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 w-20 text-center focus:outline-none focus:border-blue-500 text-slate-800"
            />
          </div>

          <button
            onClick={handleCreate} disabled={loading || loadingFile || texto.length < 20}
            className="mt-4 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
          >
            {loading ? '⏳ Generando preguntas...' : 'Generar Preguntas y Crear Sala'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-slate-500 hover:text-blue-700 text-sm font-medium transition-colors">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}