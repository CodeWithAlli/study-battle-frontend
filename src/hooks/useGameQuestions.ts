import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type QuestionReview = {
  question_text: string
  options: string[]
  correct_index: number
  justification: string
}

export function useGameQuestions(gameId: string | null) {
  const [questions, setQuestions] = useState<QuestionReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) return

    const fetchQuestions = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('questions')
        .select('question_text, options, correct_index, justification')
        .eq('game_id', gameId)
        .order('order_index', { ascending: true })

      if (data) setQuestions(data)
      setLoading(false)
    }

    fetchQuestions()
  }, [gameId])

  return { questions, loading }
}