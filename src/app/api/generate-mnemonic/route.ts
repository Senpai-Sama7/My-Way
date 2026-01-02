import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/zai'

export async function POST(request: NextRequest) {
  try {
    const { content, gradeLevel } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      )
    }

    // Create a system prompt for mnemonic generation
    const systemPrompt = `You are an expert educator specializing in memory aids and learning strategies. Your task is to create memorable mnemonics for challenging concepts or lists.

Mnemonic Guidelines:
- Identify terms, sequences, or lists that would benefit from a memory aid
- Create first-letter mnemonics or acronyms
- Make mnemonics easy to remember and meaningful
- Connect mnemonic to the actual content semantically
- Ensure the mnemonic sentence is coherent and makes sense
- Make it age-appropriate for the specified grade level

Types of Mnemonics:
1. First-letter: Each word starts with first letter of items to remember
2. Sentence: Create a story where each word starts with first letter
3. Rhyme: Create a memorable rhyme
4. Association: Connect new info to familiar concepts

Output Format:
Return a JSON object with the following structure:
{
  "mnemonic": {
    "term": "The term or concept to remember",
    "mnemonic": "The mnemonic device",
    "explanation": "Explanation of how the mnemonic works and how it connects to the content"
  } | null
}

- If content doesn't contain mnemonics-worthy items, return {"mnemonic": null}
- Focus on factual information, sequences, or lists
- Mnemonics should be creative and memorable`

    const userPrompt = `Analyze the following content and create helpful mnemonics for terms or concepts that would benefit from memory aids.

Grade Level: ${gradeLevel}

Content:
${content}

Return ONLY the JSON object:`

    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    } as any)

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Model did not return JSON.' }, { status: 502 })
      }

      const data = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        success: true,
        mnemonic: data?.mnemonic ?? null,
      })
    } catch (parseError) {
      console.error('Failed to parse mnemonic JSON:', parseError)
      return NextResponse.json({ error: 'Model returned invalid JSON.' }, { status: 502 })
    }
  } catch (error) {
    console.error('Mnemonic generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate mnemonic' },
      { status: 500 }
    )
  }
}
