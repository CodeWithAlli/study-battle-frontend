type PodiumItem = { nickname: string; value: number | string }

export function Podium({ title, subtitle, items }: {
  title: string; subtitle?: string; items: PodiumItem[]
}) {
  const medallas = ['🥇', '🥈', '🥉']
  
  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold text-center text-slate-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 text-center mb-4">{subtitle}</p>}
      
      {items.length === 0 ? (
        <p className="text-center text-slate-400 mt-4 italic">Sin datos</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {items.map((it, i) => (
            <li key={it.nickname} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-medium text-sm md:text-base text-slate-700">
                <span className="mr-2 text-lg">{medallas[i]}</span> 
                {it.nickname}
              </span>
              <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded">
                {it.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}