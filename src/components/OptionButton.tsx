export function OptionButton({ 
  text, index, selected, onClick, disabled, correctIndex, revealed 
}: { 
  text: string, index: number, selected: boolean, onClick: () => void, disabled: boolean,
  correctIndex?: number, revealed?: boolean
}) {
  let colorClass = "bg-white hover:bg-slate-50 border-slate-300 text-slate-700"
  
  if (revealed) {
    if (index === correctIndex) {
      colorClass = "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm" // Correcta
    } else if (selected) {
      colorClass = "bg-red-50 border-red-500 text-red-900" // Falló
    } else {
      colorClass = "bg-slate-50 opacity-50 border-slate-200 text-slate-400" // No elegida
    }
  } else if (selected) {
    colorClass = "bg-blue-50 border-blue-600 text-blue-900 shadow-sm" // Seleccionada
  } else if (disabled) {
    colorClass = "opacity-60"
  }

  const letras = ['A', 'B', 'C', 'D']

  return (
    <button
      onClick={onClick}
      disabled={disabled || revealed}
      className={`${colorClass} border-2 text-left p-4 rounded-xl w-full transition-colors duration-200 flex items-center gap-4 ${disabled || revealed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`w-8 h-8 rounded flex items-center justify-center font-bold ${selected ? 'bg-white/50' : 'bg-slate-200 text-slate-600'}`}>
        {letras[index]}
      </span>
      <span className="font-medium text-lg">{text}</span>
    </button>
  )
}