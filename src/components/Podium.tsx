type PodiumItem = { nickname: string; value: number | string }

export function Podium({ title, subtitle, items }: {
  title: string; subtitle?: string; items: PodiumItem[]
}) {
  const medallas = ['🥇', '🥈', '🥉']
  
  return (
    <div className="rounded-2xl bg-gray-800 p-6 border border-gray-700 shadow-xl flex flex-col h-full">
      <h3 className="text-xl font-bold text-center mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 text-center mb-4">{subtitle}</p>}
      
      {items.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">Sin datos</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {items.map((it, i) => (
            <li key={it.nickname} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg">
              <span className="font-medium text-sm md:text-base">
                <span className="mr-2 text-lg">{medallas[i]}</span> 
                {it.nickname}
              </span>
              <span className="font-mono text-cyan-400 font-bold bg-cyan-900/30 px-2 py-1 rounded">
                {it.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}