import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-4">
      
      {/* Contenedor principal estilo tarjeta */}
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
        
        {/* Icono decorativo */}
        <div className="text-6xl mb-4">🎓</div>
        
        <h1 className="text-4xl font-bold mb-2 text-slate-900">
          Study Battle
        </h1>
        <p className="text-slate-500 mb-8 font-medium">
          Demuestra cuánto sabes y apuesta por ti
        </p>

        <div className="flex flex-col gap-4">
          <Link 
            to="/create" 
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-colors shadow-sm"
          >
            Crear Partida (Profe)
          </Link>
          <Link 
            to="/join" 
            className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 font-bold py-4 rounded-xl transition-colors shadow-sm"
          >
            Unirse a Partida (Alumno)
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Proyecto Final - SENATI 2026
        </p>
      </div>

    </div>
  )
}