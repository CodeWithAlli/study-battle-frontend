import { Link } from 'react-router-dom'
import { Trophy, Zap, BarChart3, UserCircle2, Users, GraduationCap, HelpCircle } from 'lucide-react'

export default function Home() {
return (
  <div className="flex flex-col min-h-screen relative overflow-hidden">
    
      {/* 🔥 BARRA DE NAVEGACIÓN SUPERIOR (Oculta en celular, visible en PC) */}
      <nav className="hidden lg:flex items-center justify-between px-8 py-4 bg-slate-900/50 border-b border-purple-500/20 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-10 h-10 object-cover rounded-full border border-purple-500" alt="logo"/>
          <span className="font-extrabold text-2xl text-white">Study<span className="text-purple-500">Battle</span></span>
        </div>
        
        {/* Enlaces de navegación (Sin Iniciar Sesión) */}
        <div className="flex items-center gap-8 text-sm font-bold text-slate-300">
          <Link to="/" className="flex items-center gap-2 hover:text-purple-400 transition-colors"><GraduationCap className="w-4 h-4"/> Inicio</Link>
          <Link to="/create" className="flex items-center gap-2 hover:text-purple-400 transition-colors"><Trophy className="w-4 h-4"/> Retos</Link>
          <Link to="/join" className="flex items-center gap-2 hover:text-purple-400 transition-colors"><BarChart3 className="w-4 h-4"/> Ranking</Link>
          <Link to="/how-it-works" className="flex items-center gap-2 hover:text-purple-400 transition-colors"><HelpCircle className="w-4 h-4"/> Cómo funciona</Link>
        </div>
      </nav>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 w-full max-w-md lg:max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 lg:gap-12 z-10 px-4 py-6 lg:py-12">
        
        {/* =========================================
            COLUMNA IZQUIERDA (Texto, Logo y Botones)
            ========================================= */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Logo Circular */}
          <div className="w-28 h-28 lg:w-36 lg:h-36 mb-4 relative">
            <div className="absolute inset-0 bg-purple-600/40 blur-2xl rounded-full"></div>
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-cover rounded-full border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.6)] relative z-10" 
            />
          </div>
          
          {/* Título */}
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-3 text-white tracking-tight">
            Study<span className="text-purple-500">Battle</span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-slate-300 text-lg lg:text-xl font-medium mb-8">
            Demuestra cuánto sabes y<br/>apuesta por ti
          </p>

          {/* Botones Principales */}
          <div className="w-full max-w-sm flex flex-col gap-4 mb-8">
            <Link 
              to="/create" 
              className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.5)] flex items-center justify-center gap-3 text-lg border border-purple-400/30"
            >
              <UserCircle2 className="w-6 h-6" /> Crear Partida (Profesor)
            </Link>
            <Link 
              to="/join" 
              className="bg-transparent border-2 border-purple-500/60 hover:border-purple-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-[0_0_15px_rgba(147,51,234,0.2)]"
            >
              <Users className="w-6 h-6" /> Unirse a Partida (Alumno)
            </Link>
          </div>

          {/* 3 Recuadros (Features) */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col items-center backdrop-blur-sm">
              <Trophy className="w-5 h-5 lg:w-8 lg:h-8 text-yellow-500 mb-1 lg:mb-2" />
              <span className="text-[9px] lg:text-xs text-slate-300 text-center font-bold uppercase tracking-wider leading-tight">Retos<br/>divertidos</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col items-center backdrop-blur-sm">
              <Zap className="w-5 h-5 lg:w-8 lg:h-8 text-purple-400 mb-1 lg:mb-2" />
              <span className="text-[9px] lg:text-xs text-slate-300 text-center font-bold uppercase tracking-wider leading-tight">Compite en<br/>tiempo real</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col items-center backdrop-blur-sm">
              <BarChart3 className="w-5 h-5 lg:w-8 lg:h-8 text-indigo-400 mb-1 lg:mb-2" />
              <span className="text-[9px] lg:text-xs text-slate-300 text-center font-bold uppercase tracking-wider leading-tight">Mide tu<br/>progreso</span>
            </div>
          </div>
        </div>

        {/* =========================================
            COLUMNA DERECHA (Imagen de Estudiantes)
            ========================================= */}
        <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end mt-2 lg:mt-0">
          {/* Resplandor morado */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-600/30 blur-[80px] rounded-full"></div>
          
          <img 
            src="/estudiantes.png" 
            alt="Estudiantes" 
            className="w-full object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] relative z-10 max-h-[35vh] lg:max-h-[75vh]"
          />
        </div>

      </div>

      {/* Footer (Visible en ambos) */}
      <div className="text-center pb-4 z-10">
        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
          Proyecto Final - SENATI 2026
        </p>
      </div>
    </div>
  )
}