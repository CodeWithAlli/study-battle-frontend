import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generarCodigoSala } from '../lib/utils'
import { generarPreguntas } from '../lib/api'
import { extraerContenidoDePPTX, extraerPDFComoBase64 } from '../lib/extractText'
import { ClipboardList, UploadCloud, BookOpen, Sparkles, ArrowLeft, Plus, Minus, GraduationCap, Trophy, BarChart3, HelpCircle, FileText, FileType } from 'lucide-react'

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
        const pdfBase64 = await extraerPDFComoBase64(file);
        imagenesExtraidas = [`data:application/pdf;base64,${pdfBase64}`]; 
        textoExtraido = "Archivo PDF adjunto.";
      } else if (file.name.endsWith('.pptx')) {
        const result = await extraerContenidoDePPTX(file)
        textoExtraido = result.texto
        imagenesExtraidas = result.imagenes
      } else {
        throw new Error('Formato no soportado. Sube un PDF o PPTX.')
      }
      
      if (textoExtraido.trim().length < 20 && imagenesExtraidas.length === 0) {
        throw new Error(`El archivo no tiene suficiente texto ni imágenes.`)
      }

      setTexto(textoExtraido.slice(0, 10000))
      setImagenes(imagenesExtraidas)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingFile(false)
    }
  }

  const handleCreate = async () => {
    if (texto.trim().length < 20 && imagenes.length === 0) {
      return setError('El texto debe tener al menos 20 caracteres o debes subir un archivo con imágenes.')
    }

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
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      
      {/* 🔥 BARRA DE NAVEGACIÓN SUPERIOR */}
      <nav className="hidden lg:flex items-center justify-between px-8 py-4 bg-slate-900/50 border-b border-purple-500/20 backdrop-blur-md z-50">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" className="w-10 h-10 object-cover rounded-full border border-purple-500" alt="logo"/>
          <span className="font-extrabold text-2xl text-white">Study<span className="text-purple-500">Battle</span></span>
        </Link>
        
        <div className="flex items-center gap-8 text-sm font-bold text-slate-300">
          <Link to="/" className="flex items-center gap-2 hover:text-purple-400 transition-colors"><GraduationCap className="w-4 h-4"/> Inicio</Link>
          <Link to="/create" className="flex items-center gap-2 hover:text-purple-400 transition-colors"><Trophy className="w-4 h-4"/> Retos</Link>
          <Link to="/join" className="flex items-center gap-2 hover:text-purple-400 transition-colors"><BarChart3 className="w-4 h-4"/> Ranking</Link>
          <Link to="/" className="flex items-center gap-2 hover:text-purple-400 transition-colors"><HelpCircle className="w-4 h-4"/> Cómo funciona</Link>
        </div>
      </nav>

      {/* 🔥 CONTENEDOR PRINCIPAL (Imagen a la izquierda, Tarjeta a la derecha) */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-row items-center justify-center gap-4 lg:gap-12 z-10 px-4 py-4 lg:py-12">
        
        {/* Imagen de los Estudiantes (Izquierda) */}
        {/* En celular está oculta para que no estorbe, en PC aparece grande a la izquierda */}
        <div className="hidden lg:flex w-[40%] relative justify-center items-center">
          {/* Resplandor de fondo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-600/20 blur-[100px] rounded-full"></div>
          
          <img 
            src="/estudiantes.png" 
            alt="Estudiantes" 
            className="w-full object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] relative z-10 max-h-[80vh]"
          />
        </div>

        {/* Tarjeta de Crear Partida (Derecha) */}
        <div className="w-full lg:w-[55%] flex flex-col items-center">
          
          {/* Botón Volver (En PC se ve arriba a la izquierda de la tarjeta) */}
          <div className="w-full flex justify-start mb-4">
            <Link to="/" className="p-2 bg-slate-800/60 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-bold">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
          </div>

          <div className="w-full bg-slate-900/60 backdrop-blur-md p-6 lg:p-8 rounded-3xl shadow-2xl border border-purple-500/30 relative">
            
            {/* Título e Íconos */}
            <div className="flex items-center gap-3 mb-2 relative">
              <ClipboardList className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-extrabold text-white">Crear Partida</h2>
              <BookOpen className="w-10 h-10 text-orange-400 absolute right-0 -top-2 opacity-80" />
            </div>
            <p className="text-slate-300 mb-6 text-sm">Sube tu archivo de clase (PDF o PPTX) o pega el texto.</p>

            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-xl mb-4 text-sm border border-red-500/30">{error}</div>}

            <div className="flex flex-col gap-4">
              
              {/* Zona de subida */}
              <div className="bg-slate-800/40 border-2 border-dashed border-purple-500/40 rounded-2xl p-6 text-center hover:border-purple-400 transition-colors relative cursor-pointer group">
                <input type="file" accept=".pdf,.pptx" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loadingFile} />
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2 group-hover:text-purple-400 transition-colors" />
                <p className="text-lg font-bold text-slate-200">{loadingFile ? '⏳ Extrayendo...' : 'Haz clic para subir un PDF o PPTX'}</p>
                <p className="text-xs text-slate-400 mt-1">o escribe directamente abajo</p>
                
                {/* Íconos decorativos de archivos */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                   <div className="w-10 h-12 bg-red-500/10 rounded-md border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-[10px] shadow-sm"><FileText className="w-5 h-5 mb-0.5"/></div>
                   <div className="w-10 h-12 bg-orange-500/10 rounded-md border border-orange-500/30 flex items-center justify-center text-orange-500 font-bold text-[10px] shadow-sm"><FileType className="w-5 h-5 mb-0.5"/></div>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={texto} onChange={(e) => setTexto(e.target.value)}
                  placeholder="El texto extraído aparecerá aquí. También puedes escribir o pegar texto..."
                  rows={4}
                  className="w-full bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-white placeholder-slate-500 resize-none text-sm"
                />
              </div>

              {/* Selector de número de preguntas */}
              <div className="flex items-center justify-between bg-slate-800/30 p-2 rounded-xl border border-slate-700">
                <label className="text-sm font-bold text-slate-300 pl-2">Número de preguntas:</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNumPreguntas(Math.max(1, numPreguntas - 1))} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 text-white"><Minus className="w-4 h-4"/></button>
                  <span className="font-bold text-xl w-6 text-center text-white">{numPreguntas}</span>
                  <button onClick={() => setNumPreguntas(Math.min(10, numPreguntas + 1))} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 text-white"><Plus className="w-4 h-4"/></button>
                </div>
              </div>

              {/* Botón de Generar */}
              <button
                onClick={handleCreate} 
                disabled={loading || loadingFile || (texto.length < 20 && imagenes.length === 0)}
                className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] flex justify-center items-center gap-2 text-lg"
              >
                {loading ? '⏳ Generando...' : <><Sparkles className="w-5 h-5"/> Generar Preguntas y Crear Sala</>}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link to="/" className="text-slate-400 hover:text-purple-400 text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4"/> Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}