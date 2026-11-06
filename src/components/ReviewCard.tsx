type ReviewItem = {
  question_text: string
  options: string[]
  correct_index: number
  player_answer: number
  justification: string
  is_correct: boolean
}

export function ReviewCard({ items }: { items: ReviewItem[] }) {
  if (items.length === 0) return null

  return (
    <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        📝 Repaso de la Sesión
      </h2>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className={`p-5 rounded-xl border-2 ${item.is_correct ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{item.is_correct ? '✅' : '❌'}</span>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg mb-2">{item.question_text}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm">
                  <div className={`p-2 rounded border ${item.is_correct ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-red-100 border-red-300 text-red-900'}`}>
                    <span className="font-semibold">Tu respuesta: </span> 
                    {item.options[item.player_answer] || 'No respondió'}
                  </div>
                  {!item.is_correct && (
                    <div className="p-2 rounded border bg-emerald-100 border-emerald-300 text-emerald-900">
                      <span className="font-semibold">Respuesta correcta: </span> 
                      {item.options[item.correct_index]}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm text-blue-900">
                  <span className="font-bold">💡 Justificación: </span>
                  {item.justification}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}