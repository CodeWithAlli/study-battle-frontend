const API_URL = import.meta.env.VITE_API_URL

export type Question = {
  question_text: string
  options: string[]
  correct_index: number
  justification: string
}

export async function generarPreguntas(
  text: string, 
  num_questions: number = 5, 
  images: string[] = []
): Promise<Question[]> {
  
  // Creamos un controlador para poder cancelar la petición si tarda demasiado
  const controller = new AbortController()
  // Límite de 90 segundos (Render a veces se demora en despertar)
  const timeoutId = setTimeout(() => controller.abort(), 90000) 

  try {
    const res = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, num_questions, images }),
      signal: controller.signal // Vinculamos el controlador
    })
    
    clearTimeout(timeoutId) // Si responde rápido, cancelamos el temporizador

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      
      // Si el backend manda un detalle en formato string (como hicimos en Python)
      const mensajeError = typeof errorData.detail === 'string' 
        ? errorData.detail 
        : 'La IA está saturada en este momento. Intenta de nuevo en unos segundos.'

      throw new Error(mensajeError)
    }
    
    const data = await res.json()
    return data.questions

  } catch (error: any) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Puede que Render esté despertando o Gemini esté saturado. Intenta de nuevo.')
    }
    
    // Si es un error de red (ej. sin internet o CORS)
    if (error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Revisa tu conexión o intenta más tarde.')
    }

    throw error
  }
}