import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const { content, materialTitle, gradeLevel, interest } = await request.json()

    if (!content || !materialTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: content and materialTitle' },
        { status: 400 }
      )
    }

    // Create a system prompt for slide generation
    const systemPrompt = `You are an expert instructional designer specializing in educational content presentation. Your task is to transform textbook content into an engaging slide deck.

Slide Guidelines:
- Create 5-8 slides covering the key concepts from the content
- Each slide should focus on one main idea or concept
- Keep text concise - use bullet points rather than paragraphs
- Include engaging hooks or questions at the beginning
- Add key takeaways or summary at the end
- Make it age-appropriate for the specified grade level
- If an interest is specified, use examples from that interest domain

Slide Structure:
For each slide, provide:
1. A clear, attention-grabbing title
2. Brief content (3-5 bullet points max)
3. 2-3 key points that should be emphasized

Output Format:
Return a JSON object with the following structure:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": "Brief description or introduction to the slide content",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}

- Content should be conversational and easy to follow
- Key points should be the most important takeaways
- Number of slides should be appropriate for the content length`

    const userPrompt = `Transform the following textbook content into an engaging slide presentation${interest ? `, personalized for ${interest}` : ''}.

Grade Level: ${gradeLevel}
Material Title: ${materialTitle}

Content:
${content}

Generate a JSON-formatted slide deck:`

    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 700,
      response_format: { type: 'json_object' },
    } as any)

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Model did not return JSON.' }, { status: 502 })
      }

      const slidesData = JSON.parse(jsonMatch[0])
      if (!slidesData?.slides || !Array.isArray(slidesData.slides)) {
        return NextResponse.json({ error: 'Invalid slides JSON shape.' }, { status: 502 })
      }

      return NextResponse.json({
        success: true,
        slides: slidesData.slides,
      })
    } catch (parseError) {
      console.error('Failed to parse slides JSON:', parseError)
      return NextResponse.json({ error: 'Model returned invalid JSON.' }, { status: 502 })
    }
  } catch (error) {
    console.error('Slides generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate slides' },
      { status: 500 }
    )
  }
}
