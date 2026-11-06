import { useParams, Link } from 'react-router-dom'
import { useGameResults, obtenerRepasoAlumno } from '../hooks/useGameResults'
import { exportarResultados } from '../lib/exportCsv'
import { useState, useEffect } from 'react'
import { useGameQuestions } from '../hooks/useGameQuestions'
import { GraduationCap, Trophy, BarChart3, HelpCircle, Download, ArrowLeft, Medal, FileText, CheckCircle2 } from 'lucide-react'

export default function Results() {
  const { gameId } = useParams<{ gameId: string }>()
  
  // 🔥 CORRECCIÓN: Solo una vez llamamos al hook de resultados
  const { resultados, loading } = useGameResults(gameId ?? null)
  
  // 🔥 LLAMAMOS AL NUEVO HOOK PARA EL PROFESOR
  const { questions: preguntasProfesor } = useGameQuestions(gameId ?? null) 

  const isHost = localStorage.getItem('isHost') === 'true'
  const playerId = localStorage.getItem('playerId')
  const [repaso, setRepaso] = useState<any[]>([])

  useEffect(() => {
    // Si es alumno, carga SU repaso. Si es profe, no carga nada (usa el otro hook).
    if (gameId && !isHost && playerId) {
      obtenerRepasoAlumno(gameId, playerId).then(setRepaso)
    }
  }, [gameId, isHost, playerId])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-purple-400 font-bold text-xl">Calculando resultados... ⏳</div>

  const ordenDominio = [...resultados].sort((a, b) => b.puntaje - a.puntaje)
  const ordenRefuerzo = [...resultados].sort((a, b) => a.puntaje - b.puntaje)
  const ordenAudacia = [...resultados].sort((a, b) => b.vecesX3 - a.vecesX3)

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-white relative pb-10">
      
      {/* HEADER DE NAVEGACIÓN */}
      <nav className="flex items-center justify-between px-6 py-3 bg-slate-900/40 border-b border-purple-500/20 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-8 h-8 object-cover rounded-full border border-purple-500" alt="logo"/>
          <span className="font-extrabold text-xl text-white">Study<span className="text-purple-500">Battle</span></span>
        </div>
        <div className="flex items-center gap-6 text-sm font-bold text-slate-300">
          <Link to="/" className="flex items-center gap-1 hover:text-purple-400 transition-colors"><GraduationCap className="w-4 h-4"/> Inicio</Link>
          <Link to="/create" className="flex items-center gap-1 hover:text-purple-400 transition-colors"><Trophy className="w-4 h-4"/> Retos</Link>
          <Link to="/join" className="flex items-center gap-1 hover:text-purple-400 transition-colors"><BarChart3 className="w-4 h-4"/> Ranking</Link>
          <Link to="/how-it-works" className="flex items-center gap-1 hover:text-purple-400 transition-colors"><HelpCircle className="w-4 h-4"/> Cómo funciona</Link>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 z-10">
        
        {/* HEADER CON IMAGEN DE FONDO */}
        <div className="relative w-full rounded-3xl overflow-hidden mb-8 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-[#0B0F19]">
          <div className="absolute inset-0 z-0">
             <img src="/resultados-bg.png" alt="Resultados" className="w-full h-full object-cover object-[center_20%] opacity-70" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center pt-16 pb-12 px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 flex items-center gap-3 drop-shadow-lg">
               Resultados de la Sesión
            </h1>
            <p className="text-slate-200 text-lg font-medium drop-shadow-md">Resumen de desempeño de los estudiantes.</p>
          </div>
        </div>

        {/* LOS 3 PODIOS */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-slate-900/70 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-bl-full -mr-4 -mt-4"></div>
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500"/> Dominio del tema</h3>
            <p className="text-sm text-slate-400 mb-4">Los que más saben</p>
            <ul className="space-y-3">
              {ordenDominio.slice(0, 3).map((r, i) => (
                <li key={r.playerId} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                  <span className="font-semibold text-sm flex items-center gap-2">
                    <Medal className={`w-4 h-4 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : 'text-orange-400'}`} /> {r.nickname}
                  </span>
                  <span className="font-mono text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded text-sm">{r.puntaje}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4"></div>
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500"/> Necesitan repasar</h3>
            <p className="text-sm text-slate-400 mb-4">Una mano no viene mal</p>
            <ul className="space-y-3">
              {ordenRefuerzo.slice(0, 3).map((r, i) => (
                <li key={r.playerId} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                  <span className="font-semibold text-sm flex items-center gap-2">
                    <Medal className={`w-4 h-4 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : 'text-orange-400'}`} /> {r.nickname}
                  </span>
                  <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded text-sm">{r.puntaje}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4"></div>
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500"/> Alta apuesta</h3>
            <p className="text-sm text-slate-400 mb-4">Se la jugaron con x3</p>
            <ul className="space-y-3">
              {ordenAudacia.slice(0, 3).map((r, i) => (
                <li key={r.playerId} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                  <span className="font-semibold text-sm flex items-center gap-2">
                    <Medal className={`w-4 h-4 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : 'text-orange-400'}`} /> {r.nickname}
                  </span>
                  <span className="font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded text-sm">{r.vecesX3} veces</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL: TABLA Y REPASO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMNA IZQUIERDA: TABLA DE JUGADORES */}
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-700/50 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">Resumen de Jugadores</h2>
              
              {isHost && (
                <button onClick={() => exportarResultados(resultados)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4"/> Descargar Reporte (CSV)
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/50 text-slate-400 text-sm">
                    <th className="p-3 font-semibold">Jugador</th>
                    <th className="p-3 text-center font-semibold">Aciertos</th>
                    <th className="p-3 text-center font-semibold">Extras</th>
                    <th className="p-3 text-right font-semibold">Puntaje</th>
                    <th className="p-3 text-right font-semibold">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r) => (
                    <tr key={r.playerId} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-medium text-white flex items-center gap-2">
                        {r.esTop1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                        {r.nickname}
                      </td>
                      <td className="p-3 text-center text-slate-300">{r.aciertos} / {r.total}</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">+{r.extras}</td>
                      <td className="p-3 text-right font-mono font-bold text-white">{r.puntaje}</td>
                      <td className="p-3 text-right font-bold text-purple-400">{r.nota_sugerida} / 20</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* COLUMNA DERECHA: REPASO DE LA SESIÓN */}
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📝 Repaso de la Sesión
            </h2>
            
            {/* 🔥 SI ES PROFESOR: Usa las preguntas del nuevo hook */}
            {isHost ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {preguntasProfesor.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl border bg-slate-800/40 border-emerald-500/30">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">✅</span>
                      <div>
                        <h3 className="font-bold text-white text-sm mb-2">{item.question_text}</h3>
                        <p className="text-emerald-400 text-xs mb-2 font-semibold">
                          Respuesta correcta: {item.options[item.correct_index]}
                        </p>
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700 text-xs text-slate-300">
                          <span className="font-bold text-blue-400">💡 Justificación: </span>
                          {item.justification}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : repaso.length > 0 ? (
              /* 🔥 SI ES ALUMNO: Muestra su propio repaso */
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {repaso.map((item, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${item.is_correct ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{item.is_correct ? '✅' : '❌'}</span>
                      <div>
                        <h3 className="font-bold text-white text-sm mb-2">{item.question_text}</h3>
                        <div className="text-xs space-y-1 mb-2">
                          <p className="text-slate-300"><span className="font-semibold text-slate-400">Tu respuesta:</span> {item.options[item.player_answer] || 'No respondió'}</p>
                          {!item.is_correct && (
                            <p className="text-emerald-400"><span className="font-semibold">Correcta:</span> {item.options[item.correct_index]}</p>
                          )}
                        </div>
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700 text-xs text-slate-300">
                          <span className="font-bold text-blue-400">💡 Justificación: </span>
                          {item.justification}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-10">No hay datos de repaso disponibles para tu usuario.</p>
            )}
          </div>

        </div>

        <div className="text-center pt-8 pb-4">
          <Link to="/" className="text-slate-400 hover:text-purple-400 font-bold transition-colors flex items-center justify-center gap-2 inline-flex bg-slate-800/50 px-6 py-3 rounded-xl border border-slate-700 hover:border-purple-500/50">
            <ArrowLeft className="w-5 h-5"/> Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  )
}