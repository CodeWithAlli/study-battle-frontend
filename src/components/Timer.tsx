import { useEffect, useState } from 'react'

export function Timer({ seconds, onTimeOut, isRunning }: { seconds: number, onTimeOut: () => void, isRunning: boolean }) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    setTimeLeft(seconds) // Reiniciar cuando cambia la pregunta
  }, [seconds])

  useEffect(() => {
    if (!isRunning) return
    if (timeLeft <= 0) {
      onTimeOut()
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, isRunning])

  const color = timeLeft > 10 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="w-full bg-gray-900 rounded-full h-4 mt-4 overflow-hidden border border-gray-700">
      <div 
        className={`${color} h-full transition-all duration-1000 ease-linear`}
        style={{ width: `${(timeLeft / seconds) * 100}%` }}
      />
    </div>
  )
}