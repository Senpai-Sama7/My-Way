import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const { content, materialTitle, gradeLevel, interest, aiConfig } = await request.json()

    if (!content || !materialTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: content and materialTitle' },
        { status: 400 }
      )
    }

    // Create a system prompt for audio lesson generation
    const systemPrompt = `You are an expert educator specializing in conversational learning. Your task is to transform textbook content into an engaging audio-graphic lesson simulating a dialogue between a teacher and a student.

Dialogue Guidelines:
- Create a natural conversation between a teacher and a student
- The teacher should explain concepts clearly and patiently
- The student should ask relevant questions and express curiosity
- The student may have misconceptions that the teacher gently corrects
- Include natural back-and-forth dialogue with interruptions and reactions
- Make it age-appropriate for the specified grade level
- If an interest is specified, use examples from that interest domain

Conversation Structure:
1. Teacher introduces the topic with an engaging hook
2. Student asks questions or expresses curiosity
3. Teacher explains concepts with examples
4. Student reflects or asks follow-up questions
5. Teacher provides clarification and reinforcement
6. Repeat for key concepts (8-12 turns total)

Visual Elements:
- Include suggested visual representations that could be displayed during the lesson
- These should be diagrams, charts, or illustrations that support the conversation

Output Format:
Return a JSON object with the following structure:
{
  "conversation": [
    {
      "speaker": "teacher" | "student",
      "text": "What is said"
    }
  ],
  "visuals": [
    "Description of visual element to display"
  ]
}

- Keep each turn concise (1-3 sentences)
- The teacher should be encouraging and supportive
- The student should sound curious and engaged
- Visuals should complement the conversation flow`

    const userPrompt = `Transform the following textbook content into an engaging audio-graphic lesson simulating a teacher-student conversation${interest ? `, personalized for ${interest}` : ''}.

Grade Level: ${gradeLevel}
Material Title: ${materialTitle}

Content:
${content}

Generate a JSON-formatted conversation with visual suggestions:`

    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.8, // Slightly higher for more natural conversation
      max_tokens: 900,
      response_format: { type: 'json_object' },
      provider: aiConfig?.provider,
      apiKey: aiConfig?.apiKey,
      baseUrl: aiConfig?.baseUrl,
      model: aiConfig?.model,
    } as any)

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Model did not return JSON.' }, { status: 502 })
      }

      const audioData = JSON.parse(jsonMatch[0])
      if (!audioData?.conversation || !Array.isArray(audioData.conversation)) {
        return NextResponse.json({ error: 'Invalid audio JSON shape.' }, { status: 502 })
      }

      return NextResponse.json({
        success: true,
        conversation: audioData.conversation,
        visuals: Array.isArray(audioData.visuals) ? audioData.visuals : [],
      })
    } catch (parseError) {
      console.error('Failed to parse audio JSON:', parseError)
      return NextResponse.json({ error: 'Model returned invalid JSON.' }, { status: 502 })
    }
  } catch (error) {
    console.error('Audio lesson generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio lesson' },
      { status: 500 }
    )
  }
}
