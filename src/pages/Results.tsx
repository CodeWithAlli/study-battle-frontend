import { useParams, Link } from 'react-router-dom'
import { useGameResults, obtenerRepasoAlumno } from '../hooks/useGameResults'
import { Podium } from '../components/Podium'
import { exportarResultados } from '../lib/exportCsv'
import { useState, useEffect } from 'react'
import { ReviewCard } from '../components/ReviewCard'

export default function Results() {
  const { gameId } = useParams<{ gameId: string }>()
  const { resultados, loading } = useGameResults(gameId ?? null)

  const isHost = localStorage.getItem('isHost') === 'true'
  const playerId = localStorage.getItem('playerId')
  const [repaso, setRepaso] = useState<any[]>([])

  useEffect(() => {
    if (!isHost && playerId && gameId) {
      obtenerRepasoAlumno(gameId, playerId).then(setRepaso)
    }
  }, [gameId, isHost, playerId])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Calculando resultados... ⏳</div>

  const ordenDominio = [...resultados].sort((a, b) => b.puntaje - a.puntaje)
  const ordenRefuerzo = [...resultados].sort((a, b) => a.puntaje - b.puntaje)
  const ordenAudacia = [...resultados].sort((a, b) => b.vecesX3 - a.vecesX3)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Resultados de la Sesión
          </h1>
          <p className="text-slate-500">Resumen de desempeño de los estudiantes.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Podium
            title="🏆 Dominio del tema"
            subtitle="Los que más saben"
            items={ordenDominio.slice(0, 3).map(r => ({ nickname: r.nickname, value: r.puntaje }))}
          />
          <Podium
            title="📚 Necesitan repasar"
            subtitle="Una mano no viene mal"
            items={ordenRefuerzo.slice(0, 3).map(r => ({ nickname: r.nickname, value: r.puntaje }))}
          />
          <Podium
            title="🎲 Alta apuesta"
            subtitle="Se la jugaron con x3"
            items={ordenAudacia.slice(0, 3).map(r => ({ nickname: r.nickname, value: `${r.vecesX3} veces` }))}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-800">Resumen de Jugadores</h2>
            <button 
              onClick={() => exportarResultados(resultados)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              📥 Descargar Reporte (CSV)
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="p-3 font-semibold">Jugador</th>
                  <th className="p-3 text-center font-semibold">Aciertos</th>
                  <th className="p-3 text-center font-semibold">Extras</th>
                  <th className="p-3 text-right font-semibold">Puntaje</th>
                  <th className="p-3 text-right font-semibold">Nota Sugerida</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r) => (
                  <tr key={r.playerId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-800">{r.nickname}</td>
                    <td className="p-3 text-center text-slate-600">{r.aciertos} / {r.total}</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">+{r.extras}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">{r.puntaje}</td>
                    <td className="p-3 text-right font-bold text-blue-700">{r.nota_sugerida} / 20</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ESTA ES LA PARTE QUE HACE QUE SALGA EL REVIEW CARD */}
        {!isHost && repaso.length > 0 && (
          <ReviewCard items={repaso} />
        )}

        <div className="text-center pt-8">
          <Link to="/" className="text-slate-500 hover:text-blue-700 font-medium underline transition-colors">
            Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  )
}