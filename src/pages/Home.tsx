import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
        Study Battle
      </h1>
      <p className="text-gray-400 mb-12 text-lg">Demuestra cuánto sabes y apuesta por ti</p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link 
          to="/create" 
          className="bg-emerald-600 hover:bg-emerald-500 text-center font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30"
        >
          Crear Partida (Profe)
        </Link>
        <Link 
          to="/join" 
          className="bg-gray-800 hover:bg-gray-700 text-center font-bold py-4 rounded-xl border border-gray-700 transition-all"
        >
          Unirse a Partida (Alumno)
        </Link>
      </div>
    </div>
  )
}