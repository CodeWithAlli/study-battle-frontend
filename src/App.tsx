import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useRef } from 'react'
import Home from './pages/Home'
import CreateGame from './pages/CreateGame'
import JoinGame from './pages/JoinGame'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Results from './pages/Results'

function App() {
  // 🔥 LÓGICA DE LA MÚSICA GLOBAL
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans relative">
        
        {/* 🔥 REPRODUCTOR Y BOTÓN GLOBAL */}
        <audio ref={audioRef} src="/musica.mp3" loop />
        <button 
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 bg-white p-4 rounded-full shadow-xl border border-slate-200 hover:bg-slate-50 transition-all z-50 text-2xl"
          title={isPlaying ? "Pausar música" : "Reproducir música"}
        >
          {isPlaying ? '🔊' : '🔇'}
        </button>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/lobby/:gameId" element={<Lobby />} />
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="/results/:gameId" element={<Results />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App