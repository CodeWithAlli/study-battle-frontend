const API_URL = import.meta.env.VITE_API_URL

export type Question = {
  question_text: string
  options: string[]
  correct_index: number
  justification: string
}

export async function generarPreguntas(text: string, num_questions: number = 5, images: string[] = []): Promise<Question[]> {
  const res = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, num_questions, images }) // 'images' ahora puede contener PDFs
  })
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail?.[0]?.msg || 'Error generando preguntas.')
  }
  
  const data = await res.json()
  return data.questions
}