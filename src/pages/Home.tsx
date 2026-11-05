import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-4">
      
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center">
        
        {/* 🔥 AQUÍ ESTÁ TU NUEVO LOGO */}
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="Study Battle Logo" 
            className="w-36 h-36 object-cover rounded-full border-4 border-white shadow-xl hover:scale-105 transition-transform duration-300" 
          />
        </div>
        
        <h1 className="text-4xl font-extrabold mb-3 text-slate-900 tracking-tight">
          Study Battle
        </h1>
        <p className="text-slate-500 mb-10 text-lg font-medium">
          Demuestra cuánto sabes y apuesta por ti
        </p>

        <div className="flex flex-col gap-4">
          <Link 
            to="/create" 
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Crear Partida (Profesor)
          </Link>
          <Link 
            to="/join" 
            className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold py-4 rounded-xl transition-all shadow-sm"
          >
            Unirse a Partida (Alumno)
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-10 font-medium">
          Proyecto Final - SENATI 2026
        </p>
      </div>

    </div>
  )
}