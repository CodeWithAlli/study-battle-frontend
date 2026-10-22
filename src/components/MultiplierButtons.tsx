import type { Multiplicador } from '../lib/scoring'

export function MultiplierButtons({ 
  onSelect, 
  disabled 
}: { 
  onSelect: (mult: Multiplicador) => void
  disabled: boolean 
}) {
  const botones = [
    { mult: 1, label: 'x1', desc: 'Seguro', color: 'bg-gray-600 hover:bg-gray-500' },
    { mult: 2, label: 'x2', desc: 'Medio', color: 'bg-orange-600 hover:bg-orange-500' },
    { mult: 3, label: 'x3', desc: 'Arriesgado', color: 'bg-red-600 hover:bg-red-500' },
  ] as const

  return (
    <div className="flex gap-4 justify-center mt-6">
      {botones.map((b) => (
        <button
          key={b.mult}
          onClick={() => onSelect(b.mult)}
          disabled={disabled}
          className={`${b.color} text-white p-4 rounded-xl w-28 shadow-lg transition-all disabled:opacity-50 flex flex-col items-center`}
        >
          <span className="text-2xl font-black">{b.label}</span>
          <span className="text-xs opacity-80">{b.desc}</span>
        </button>
      ))}
    </div>
  )
}