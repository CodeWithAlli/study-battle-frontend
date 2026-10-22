import { useParams, Link } from 'react-router-dom'
import { useGameResults } from '../hooks/useGameResults'
import { Podium } from '../components/Podium'
import { exportarResultados } from '../lib/exportCsv'

export default function Results() {
  const { gameId } = useParams<{ gameId: string }>()
  const { resultados, loading } = useGameResults(gameId ?? null)

  if (loading) return <div className="p-8 text-center text-white min-h-screen flex items-center justify-center">Calculando resultados... ⏳</div>

  // Ordenar para los diferentes podios
  const ordenDominio = [...resultados].sort((a, b) => b.puntaje - a.puntaje)
  const ordenRefuerzo = [...resultados].sort((a, b) => a.puntaje - b.puntaje) // Los que menos puntaje tienen
  const ordenAudacia = [...resultados].sort((a, b) => b.vecesX3 - a.vecesX3)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
            ¡Partida Terminada!
          </h1>
          <p className="text-gray-400">Aquí están los resultados de la sesión.</p>
        </div>

        {/* Los 3 Podios */}
        <div className="grid gap-6 md:grid-cols-3">
          <Podium
            title="🏆 Dominio del tema"
            subtitle="Los que más saben"
            items={ordenDominio.slice(0, 3).map(r => ({
              nickname: r.nickname, value: r.puntaje
            }))}
          />
          <Podium
            title="📚 Necesitan repasar"
            subtitle="Una mano no viene mal"
            items={ordenRefuerzo.slice(0, 3).map(r => ({
              nickname: r.nickname, value: r.puntaje
            }))}
          />
          <Podium
            title="🎲 Alta apuesta"
            subtitle="Se la jugaron con x3"
            items={ordenAudacia.slice(0, 3).map(r => ({
              nickname: r.nickname, value: `${r.vecesX3} veces`
            }))}
          />
        </div>

        {/* Tabla detallada y Botón CSV */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">Resumen de Jugadores</h2>
            <button 
              onClick={() => exportarResultados(resultados)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              📥 Descargar Resultados (CSV)
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="p-3">Jugador</th>
                  <th className="p-3 text-center">Aciertos</th>
                  <th className="p-3 text-center">Extras</th>
                  <th className="p-3 text-right">Puntaje</th>
                  <th className="p-3 text-right">Nota Sugerida</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r) => (
                  <tr key={r.playerId} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                    <td className="p-3 font-medium">{r.nickname}</td>
                    <td className="p-3 text-center">{r.aciertos} / {r.total}</td>
                    <td className="p-3 text-center text-emerald-400">+{r.extras}</td>
                    <td className="p-3 text-right font-mono font-bold">{r.puntaje}</td>
                    <td className="p-3 text-right font-bold text-cyan-400">{r.nota_sugerida} / 20</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link to="/" className="text-gray-400 hover:text-white underline">
            Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  )
}