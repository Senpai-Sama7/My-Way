import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/zai'

export async function POST(request: NextRequest) {
  try {
    const { sectionTitle, sectionContent, gradeLevel, interest } = await request.json()

    if (!sectionTitle || !sectionContent) {
      return NextResponse.json(
        { error: 'Missing required fields: sectionTitle and sectionContent' },
        { status: 400 }
      )
    }

    // Create the system prompt for question generation
    const systemPrompt = `You are an expert educator specializing in formative assessment. Your task is to generate embedded questions that help learners check their understanding as they read.

Question Guidelines:
- Create multiple-choice questions with 4 options (A, B, C, D)
- Questions should be based on the provided content
- Questions should test comprehension and understanding
- Include one clearly correct answer and three plausible distractors
- Avoid obvious trick questions
- Make questions age-appropriate for the specified grade level
- If an interest is specified, use examples from that interest domain

Output Format:
Return a JSON object with the following structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of why the correct answer is right"
}

- correctAnswer should be 0 for A, 1 for B, 2 for C, or 3 for D
- The explanation should reinforce learning, not just state the answer`

    const userPrompt = `Generate an embedded question for the following learning material${interest ? `, personalized for ${interest}` : ''}.

Grade Level: ${gradeLevel}

Section Title: ${sectionTitle}

Section Content:
${sectionContent}

Generate a JSON-formatted multiple-choice question:`

    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    } as any)

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Model did not return JSON.' }, { status: 502 })
      }

      const questionData = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        success: true,
        question: questionData,
      })
    } catch (parseError) {
      console.error('Failed to parse question JSON:', parseError)
      return NextResponse.json({ error: 'Model returned invalid JSON.' }, { status: 502 })
    }

  } catch (error) {
    console.error('Question generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    )
  }
}
