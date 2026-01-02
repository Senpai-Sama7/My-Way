import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, interest } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Missing required field: topic' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert educator specializing in creating relatable examples that illustrate complex concepts. Your examples help learners understand abstract ideas through concrete, real-world applications.

Example Generation Principles:
1. Make examples concrete and specific - avoid vague statements
2. Connect examples to the learner's specified interests when possible
3. Use age-appropriate scenarios and contexts
4. Show the "why" - explain how each example demonstrates the concept
5. Vary example types:
   - Everyday situations
   - Historical or scientific examples
   - Pop culture references (if relevant)
   - Professional or academic applications

Example Structure:
For each example:
- Start with "Imagine..." or "Think about..." to engage the learner
- Present a clear scenario where the concept applies
- Explain how the concept works in that scenario
- Connect back to the core idea
- End with a reflective question or insight

Adaptation by Difficulty:
- Level 6-7: Simple, everyday examples (sports, games, home activities)
- Level 8-10: Moderate complexity (school projects, hobbies, community events)
- Level 11-13: Advanced examples (workplace scenarios, academic research, complex systems)

Interest Integration:
${interest ? `- Actively incorporate ${interest} into at least 2-3 examples` : '- Use universally relatable scenarios (technology, social media, daily life)'}

Output Format:
Return a JSON object:
{
  "type": "example",
  "content": "Introductory text explaining why examples help",
  "metadata": {
    "topic": "${topic}",
    "difficulty": ${difficulty || 7},
    "examples": [
      {
        "title": "Short, memorable title for the example",
        "scenario": "The actual example scenario",
        "explanation": "How this example illustrates the concept",
        "connection": "How it connects to the core idea"
      }
    ]
  }
}

Quality Guidelines:
- Examples should feel personal and directly relevant
- Avoid cliché or overused examples unless they're particularly effective
- Use vivid language that creates mental imagery
- Each example should be self-contained and understandable
- Progressively build complexity across examples
- Include a surprising or counterintuitive example to challenge assumptions`

    const userPrompt = `Generate 3-4 concrete, engaging examples that illustrate the following concept.

Topic: ${topic}
Difficulty Level: ${difficulty || 7}
Learner Interest: ${interest || 'Not specified - use universal examples'}

Create examples that help the learner truly understand ${topic} through concrete scenarios.`

    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.9, // Higher for more creative examples
      max_tokens: 700,
      response_format: { type: 'json_object' },
    } as any)

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Model did not return JSON.' }, { status: 502 })
      }

      const responseData = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        success: true,
        ...responseData,
      })
    } catch (e) {
      console.error('Failed to parse examples JSON:', e)
      return NextResponse.json({ error: 'Model returned invalid JSON.' }, { status: 502 })
    }
  } catch (error) {
    console.error('Example generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate examples' },
      { status: 500 }
    )
  }
}
