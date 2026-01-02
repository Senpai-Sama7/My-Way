import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      )
    }

    // Generate the audio discussion
    const systemPrompt = `You are an expert at creating educational audio discussions about academic papers. Your task is to transform an academic paper into an engaging, informative conversation between experts.

Discussion Structure:
- Include 2-3 speakers with different perspectives:
  1. Moderator: Guides the conversation, asks clarifying questions
  2. Expert: Explains the paper's findings enthusiastically
  3. Skeptic (optional): Asks critical questions, raises alternative interpretations
- Create 12-16 conversational turns
- Make it natural and engaging, like a podcast or seminar
- Cover: introduction, methodology, key findings, implications, limitations
- Include reactions, follow-ups, and natural conversational elements

Content Guidelines:
- Simplify academic jargon while maintaining accuracy
- Explain complex concepts clearly
- Highlight the most important contributions
- Discuss real-world applications
- Maintain scientific rigor
- Make it accessible to educated non-experts

Output Format:
Return a JSON object with the following structure:
{
  "title": "Discussion title (based on paper)",
  "summary": "2-3 sentence overview of what will be discussed",
  "speakers": [
    {
      "name": "Speaker name",
      "role": "moderator" | "expert" | "skeptic"
    }
  ],
  "discussion": [
    {
      "speaker": "Speaker name",
      "role": "moderator" | "expert" | "skeptic",
      "text": "What is said in this turn"
    }
  ],
  "keyPoints": [
    "Key point 1",
    "Key point 2"
  ]
}

- Each turn should be 2-4 sentences
- Include natural interjections and reactions
- Speakers should have distinct voices/perspectives
- Key points should be the main takeaways
- Summary should hook listeners into the discussion`

    const userPrompt = `Transform the following academic paper into an engaging audio discussion between experts.

Paper Title: ${title || 'Untitled Paper'}

Paper Content:
${content}

Generate a JSON-formatted audio discussion with speakers, turns, and key points:`

    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.8, // Higher for more natural conversation
      max_tokens: 900,
      response_format: { type: 'json_object' },
    } as any)

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const discussionData = JSON.parse(jsonMatch[0])
        return NextResponse.json({
          success: true,
          ...discussionData,
        })
      }

      return NextResponse.json({ error: 'Model did not return JSON.' }, { status: 502 })
    } catch (parseError) {
      console.error('Failed to parse discussion JSON:', parseError)
      return NextResponse.json({ error: 'Model returned invalid JSON.' }, { status: 502 })
    }
  } catch (error) {
    console.error('Audio discussion generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio discussion' },
      { status: 500 }
    )
  }
}
