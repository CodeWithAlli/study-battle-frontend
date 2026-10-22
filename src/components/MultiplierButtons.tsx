import type { Multiplicador } from '../lib/scoring'

export function MultiplierButtons({ 
  onSelect, 
  disabled 
}: { 
  onSelect: (mult: Multiplicador) => void
  disabled: boolean 
}) {
  const botones = [
    { mult: 1, label: 'x1', desc: 'Seguro', color: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' },
    { mult: 2, label: 'x2', desc: 'Medio', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-300' },
    { mult: 3, label: 'x3', desc: 'Arriesgado', color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300' },
  ] as const

  return (
    <div className="flex gap-4 justify-center mt-6">
      {botones.map((b) => (
        <button
          key={b.mult}
          onClick={() => onSelect(b.mult)}
          disabled={disabled}
          className={`${b.color} border-2 p-4 rounded-xl w-28 shadow-sm transition-all disabled:opacity-50 flex flex-col items-center`}
        >
          <span className="text-2xl font-black">{b.label}</span>
          <span className="text-xs font-medium opacity-80">{b.desc}</span>
        </button>
      ))}
    </div>
  )
}