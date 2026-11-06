import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useRef } from 'react'
import Home from './pages/Home'
import CreateGame from './pages/CreateGame'
import JoinGame from './pages/JoinGame'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Results from './pages/Results'
import HowItWorks from './pages/HowItWorks'

function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause()
      else audioRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans relative bg-[#0B0F19] text-white overflow-hidden">
        
        {/* 🔥 FONDO CON LÍNEAS SUTILES (Igual a la referencia) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          
          {/* Fondo base degradado (muy oscuro) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#130a24] via-[#0B0F19] to-[#0B0F19]"></div>

          {/* Línea azul sutil (izquierda a derecha) */}
          <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path 
              d="M -10 80 Q 30 120 60 50 T 110 10" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="0.8" 
            />
          </svg>

          {/* Línea morada sutil (cruzada) */}
          <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path 
              d="M 110 90 Q 70 110 40 60 T -10 20" 
              fill="none" 
              stroke="#a855f7" 
              strokeWidth="0.5" 
            />
          </svg>

          {/* Resplandor suave en las esquinas (para dar profundidad) */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        </div>

        <audio ref={audioRef} src="/musica.mp3" loop />
        <button 
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 bg-slate-800/80 backdrop-blur-md p-4 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-500/50 hover:bg-slate-700 transition-all z-50 text-xl"
        >
          {isPlaying ? '🔊' : '🔇'}
        </button>

        <div className="relative z-10 h-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/create" element={<CreateGame />} />
            <Route path="/join" element={<JoinGame />} />
            <Route path="/lobby/:gameId" element={<Lobby />} />
            <Route path="/game/:gameId" element={<Game />} />
            <Route path="/results/:gameId" element={<Results />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App