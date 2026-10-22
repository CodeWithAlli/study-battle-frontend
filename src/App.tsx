import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreateGame from './pages/CreateGame'
import JoinGame from './pages/JoinGame'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Results from './pages/Results'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans">
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