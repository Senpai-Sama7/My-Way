import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/ai-client'

interface QuizSubmission {
  title?: string
  questions: Array<{
    id: string
    correctAnswer: number
    difficulty: 'easy' | 'medium' | 'hard'
    explanation?: string
  }>
  answers: Record<string, number>
}

export async function POST(request: NextRequest) {
  try {
    const { title, questions, answers }: QuizSubmission = await request.json()

    if (!questions || !Array.isArray(questions) || questions.length === 0 || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: questions and answers' },
        { status: 400 }
      )
    }

    // Calculate score
    let correctCount = 0
    const detailedResults = questions.map((q) => {
      const userAnswer = answers[q.id]
      const isCorrect = userAnswer === q.correctAnswer
      if (isCorrect) correctCount++

      return {
        questionId: q.id,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation ?? '',
        difficulty: q.difficulty,
      }
    })

    const score = (correctCount / questions.length) * 100
    const scorePercentage = Math.round(score)

    const feedbackPrompt = `You are an encouraging educator providing personalized quiz feedback. Based on the quiz results, provide:

1. Overall score and performance assessment
2. Glow (Strengths): What the learner did well on
3. Grows (Areas for Improvement): What concepts need more focus
4. Personalized next steps: Specific recommendations for improvement
5. Encouraging closing

Score: ${scorePercentage}% (${correctCount}/${questions.length} correct)
Quiz Title: ${title || 'Quiz'}

Detailed Results:
${detailedResults
  .map((r) => `- ${r.questionId}: ${r.isCorrect ? '✓ Correct' : '✗ Incorrect'} (Difficulty: ${r.difficulty})`)
  .join('\n')}

Generate feedback that is:
- Specific to this performance
- Encouraging even if score is low
- Actionable with clear next steps
- Professional yet warm tone

Return a JSON object:
{
  "score": ${scorePercentage},
  "correctCount": ${correctCount},
  "totalCount": ${questions.length},
  "glow": "Specific strengths demonstrated",
  "grows": "Specific areas to improve",
  "nextSteps": "Personalized recommendations",
  "feedback": "Encouraging overall message"
}`

    const feedbackResponse = await llmChat({
      messages: [{ role: 'user', content: feedbackPrompt }],
      temperature: 0.8,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    } as any)

    const jsonMatch = feedbackResponse.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Model did not return JSON feedback.' }, { status: 502 })
    }

    const feedbackData = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      score: scorePercentage,
      correctCount,
      totalCount: questions.length,
      detailedResults,
      ...feedbackData,
    })
  } catch (error) {
    console.error('Quiz submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}
