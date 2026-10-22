export function OptionButton({ 
  text, 
  index, 
  selected, 
  onClick, 
  disabled,
  correctIndex,
  revealed 
}: { 
  text: string, 
  index: number, 
  selected: boolean, 
  onClick: () => void, 
  disabled: boolean,
  correctIndex?: number,
  revealed?: boolean
}) {
  // Colores base
  let colorClass = "bg-gray-800 hover:bg-gray-700 border-gray-600"
  let opacityClass = ""
  
  // Si ya se reveló (terminó el tiempo o respondió)
  if (revealed) {
    if (index === correctIndex) {
      colorClass = "bg-emerald-600 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" // Correcta
    } else if (selected) {
      colorClass = "bg-red-600 border-red-400" // Falló
    } else {
      colorClass = "bg-gray-800 opacity-40 border-gray-700" // No elegida
    }
  } 
  // Si NO se ha revelado, pero el alumno ya marcó esta opción
  else if (selected) {
    colorClass = "bg-cyan-600 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
  }
  // Si NO se ha revelado, pero el alumno ya marcó OTRA opción (bloquear esta visualmente)
  else if (disabled) {
    opacityClass = "opacity-50"
  }

  const letras = ['A', 'B', 'C', 'D']

  return (
    <button
      onClick={onClick}
      disabled={disabled || revealed}
      className={`${colorClass} ${opacityClass} border-2 text-left p-4 rounded-xl w-full transition-all duration-200 flex items-center gap-4 ${disabled || revealed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${selected ? 'bg-white/20' : 'bg-black/30'}`}>
        {letras[index]}
      </span>
      <span className="font-medium text-lg">{text}</span>
    </button>
  )
}