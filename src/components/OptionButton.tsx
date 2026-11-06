export function OptionButton({ 
  text, index, selected, onClick, disabled, correctIndex, revealed 
}: { 
  text: string, index: number, selected: boolean, onClick: () => void, disabled: boolean,
  correctIndex?: number, revealed?: boolean
}) {
  // Colores base por defecto (estado inicial)
  const baseColors = [
    "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900",
    "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900",
    "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900",
    "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900",
  ]

  let colorClass = baseColors[index % 4]
  let iconBg = ["bg-blue-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"][index % 4]

  // Lógica de estados
  if (revealed) {
    if (index === correctIndex) {
      colorClass = "bg-emerald-100 border-emerald-500 text-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
      iconBg = "bg-emerald-600"
    } else if (selected) {
      colorClass = "bg-red-100 border-red-500 text-red-900" 
      iconBg = "bg-red-600"
    } else {
      colorClass = "bg-slate-50 opacity-50 border-slate-200 text-slate-400" 
      iconBg = "bg-slate-300"
    }
  } else if (selected) {
    colorClass = "bg-blue-100 border-blue-600 text-blue-900 shadow-[0_0_15px_rgba(37,99,235,0.2)] ring-2 ring-blue-600" 
    iconBg = "bg-blue-700"
  } else if (disabled) {
    colorClass = "opacity-60"
  }

  const letras = ['A', 'B', 'C', 'D']

  return (
    <button
      onClick={onClick}
      disabled={disabled || revealed}
      className={`${colorClass} border-2 text-left p-4 rounded-xl w-full transition-all duration-200 flex items-center gap-4 ${disabled || revealed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-lg shadow-sm ${iconBg}`}>
        {letras[index]}
      </span>
      <span className="font-medium text-lg flex-1">{text}</span>
      
      {/* Icono de check cuando se revela */}
      {revealed && index === correctIndex && (
        <span className="text-2xl">✅</span>
      )}
      {revealed && selected && index !== correctIndex && (
        <span className="text-2xl">❌</span>
      )}
    </button>
  )
}