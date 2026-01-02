import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const { text, gradeLevel, interest } = await request.json()

    if (!text || !gradeLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: text and gradeLevel' },
        { status: 400 }
      )
    }

    // Create the system prompt for personalization
    const systemPrompt = `You are an expert educator specializing in personalized learning content. Your task is to adapt textbook content to match specific learner attributes while maintaining educational integrity.

Grade Level Adaptation:
- Adapt the reading complexity to match the specified grade level (6-13, where 13 is undergraduate)
- Use the Flesch-Kincaid Grade Level principles to guide your adaptation
- Keep sentences shorter and simpler for lower grade levels
- Use simpler vocabulary for lower grade levels
- Maintain accuracy and factual correctness
- Ensure all key concepts are covered

Interest-Based Personalization:
- Incorporate examples and analogies related to the specified interest
- Map new concepts to familiar domains within the interest area
- Make the content more relatable and engaging for the learner
- Highlight personalized sections by wrapping them in brackets like [this]

Output Format:
- Return ONLY the adapted text
- Do not include explanations or meta-commentary
- Maintain the original structure and flow of the content
- Ensure the personalized sections are clearly marked with brackets`

    const userPrompt = `Please adapt the following textbook content for a ${gradeLevel} grade level${interest ? ` with personalization for ${interest}` : ''}.

Original Text:
${text}

Provide the personalized and adapted text:`

    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 600,
    })

    const personalizedText = response.text

    return NextResponse.json({
      success: true,
      personalizedText,
    })
  } catch (error) {
    console.error('Personalization error:', error)
    return NextResponse.json(
      { error: 'Failed to personalize content' },
      { status: 500 }
    )
  }
}
