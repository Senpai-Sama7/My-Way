import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/zai'

export async function POST(request: NextRequest) {
  try {
    const { materialTitle, sections, gradeLevel, interest, totalQuestions } = await request.json()

    if (!materialTitle || !sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Missing required fields: materialTitle and sections' },
        { status: 400 }
      )
    }

    const total = typeof totalQuestions === 'number' && Number.isFinite(totalQuestions)
      ? Math.max(5, Math.min(20, Math.round(totalQuestions)))
      : 10

    const sectionText = sections
      .map((s: any, idx: number) => {
        const title = typeof s?.title === 'string' ? s.title : `Section ${idx + 1}`
        const content = typeof s?.content === 'string' ? s.content : ''
        return `## ${title}\n${content}`
      })
      .join('\n\n')

    // Create a system prompt for quiz generation
    const systemPrompt = `You are an expert educator specializing in formative assessment. Your task is to generate a quiz for the provided learning material.

Quiz Guidelines:
- Generate exactly ${total} multiple-choice questions
- Questions should cover the material comprehensively (across all sections)
- Include a mix of difficulty levels:
  - Easy: Basic recall and comprehension
  - Medium: Application and analysis
  - Hard: Evaluation and synthesis
- Each question should have 4 options (A, B, C, D)
- Include one clearly correct answer and three plausible distractors
- Avoid trick questions
- Make questions age-appropriate for the specified grade level
- If an interest is specified, use examples from that interest domain

Output Format:
Return a JSON object with the following structure:
{
  "questions": [
    {
      "id": "unique-question-id",
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of the correct answer",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

- correctAnswer should be 0 for A, 1 for B, 2 for C, or 3 for D
- Each question needs a unique ID
`

    const userPrompt = `Generate a quiz for the following learning material${interest ? `, using examples from ${interest}` : ''}.

Grade Level: ${gradeLevel}
Material Title: ${materialTitle}

Content:
${sectionText}

Return ONLY the JSON object.`

    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    } as any)

    const jsonMatch = response.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Model did not return JSON.' }, { status: 502 })
    }

    const questionsData = JSON.parse(jsonMatch[0])

    if (!questionsData?.questions || !Array.isArray(questionsData.questions)) {
      return NextResponse.json({ error: 'Invalid quiz JSON shape.' }, { status: 502 })
    }

    return NextResponse.json({ success: true, questions: questionsData.questions })
  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}
