import { Link } from 'react-router-dom'
import { ArrowLeft, UploadCloud, Cpu, Smartphone, BarChart3, CheckCircle2 } from 'lucide-react'

export default function HowItWorks() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 lg:p-8 relative">
      
      {/* Botón Volver */}
      <div className="w-full max-w-4xl flex justify-start mb-8">
        <Link to="/" className="p-2 bg-slate-800/60 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>

      {/* Título Principal */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
          ¿Cómo funciona <span className="text-purple-500">Study Battle</span>?
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Convierte tu material de clase en un juego interactivo en menos de 1 minuto. Sin complicaciones, solo aprendizaje y diversión.
        </p>
      </div>

      {/* Pasos (Grid) */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Paso 1 */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-purple-500/30 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 border border-purple-500/50">
            <UploadCloud className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">1. Sube tu material</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            El profesor ingresa a la plataforma y sube su archivo de clase: puede ser un PDF, una presentación en PowerPoint (PPTX) o simplemente pegar el texto.
          </p>
        </div>

        {/* Paso 2 */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-purple-500/30 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/50">
            <Cpu className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">2. La IA genera el Quiz</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Nuestra inteligencia artificial lee el documento, analiza el contenido e incluso las imágenes, y genera automáticamente preguntas de opción múltiple con su justificación.
          </p>
        </div>

        {/* Paso 3 */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-purple-500/30 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/50">
            <Smartphone className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">3. Los alumnos juegan</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Los estudiantes escanean un código QR con su celular o ingresan el código de sala. Escriben su nombre, eligen su nivel de riesgo (x1, x2, x3) y compiten respondiendo en tiempo real.
          </p>
        </div>

        {/* Paso 4 */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-purple-500/30 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 border border-blue-500/50">
            <BarChart3 className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">4. Resultados inmediatos</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Al finalizar, el profesor obtiene un reporte completo con los puntajes y estadísticas de cada alumno. Los estudiantes reciben una tarjeta de repaso con las respuestas correctas.
          </p>
        </div>

      </div>

      {/* Banner inferior */}
      <div className="w-full max-w-5xl mt-12 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-6 rounded-2xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Cero preparación de exámenes</h3>
            <p className="text-slate-300 text-sm">El docente recupera sus horas y evalúa jugando.</p>
          </div>
        </div>
        <Link 
          to="/create" 
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)] whitespace-nowrap"
        >
          Crear mi primera partida
        </Link>
      </div>

    </div>
  )
}