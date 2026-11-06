type PodiumItem = { nickname: string; value: number | string }

export function Podium({ title, subtitle, items }: {
  title: string; subtitle?: string; items: PodiumItem[]
}) {
  // Diferentes íconos según la posición
  const medallas = ['👑', '🥈', '🥉']
  
  // Colores de fondo para las tarjetas del podio
  const fondos = [
    'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200', // Top 1 (Oro)
    'bg-slate-50 border-slate-200', // Top 2 (Plata)
    'bg-orange-50 border-orange-100', // Top 3 (Bronce)
  ]

  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold text-center text-slate-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 text-center mb-4">{subtitle}</p>}
      
      {items.length === 0 ? (
        <p className="text-center text-slate-400 mt-4 italic">Sin datos</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {items.map((it, i) => (
            <li key={it.nickname} className={`flex items-center justify-between p-3 rounded-xl border ${fondos[i] || 'bg-slate-50 border-slate-100'} transition-transform hover:scale-[1.02]`}>
              <span className="font-semibold text-sm md:text-base text-slate-800 flex items-center gap-2">
                <span className="text-xl drop-shadow-sm">{medallas[i]}</span> 
                {it.nickname}
              </span>
              <span className="font-mono text-blue-800 font-bold bg-white/60 px-3 py-1 rounded-lg">
                {it.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}