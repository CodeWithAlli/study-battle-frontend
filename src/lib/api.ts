const API_URL = import.meta.env.VITE_API_URL

export type Question = {
  question_text: string
  options: string[]
  correct_index: number
  justification: string
}

export async function generarPreguntas(text: string, num_questions: number = 5): Promise<Question[]> {
  const res = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, num_questions })
  })
  
  if (!res.ok) {
    throw new Error('Error generando preguntas. Puede que el servidor esté despertando, intenta de nuevo.')
  }
  
  const data = await res.json()
  return data.questions
}