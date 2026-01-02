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

    // Create a system prompt for mind map generation
    const systemPrompt = `You are an expert instructional designer specializing in knowledge organization. Your task is to transform textbook content into a hierarchical mind map structure.

Mind Map Guidelines:
- Organize content into a hierarchical structure
- Root node should be the main topic or material title
- Level 1 nodes should be major sections or key concepts
- Level 2+ nodes should be sub-concepts, details, or examples
- Maintain logical grouping and relationships
- Make it age-appropriate for the specified grade level
- If an interest is specified, organize examples around that interest domain

Node Structure:
- Each node needs: ID, label, level, and optional children
- Root level (0): Main topic
- Level 1: Major categories or sections
- Level 2: Key points under each category
- Level 3: Supporting details or examples

Output Format:
Return a JSON object with the following structure:
{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Node label",
      "level": 0,
      "children": ["child-id-1", "child-id-2"]
    }
  ]
}

- IDs should be unique and descriptive (e.g., "root", "definition", "example-1")
- Labels should be concise (2-6 words)
- Ensure proper parent-child relationships via children arrays
- Maintain logical flow from general to specific`

    const userPrompt = `Transform the following textbook content into a hierarchical mind map structure${interest ? `, with examples from ${interest}` : ''}.

Grade Level: ${gradeLevel}
Material Title: ${materialTitle}

Content:
${content}

Generate a JSON-formatted mind map structure:`

    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.6,
      max_tokens: 700,
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

      const mindmapData = JSON.parse(jsonMatch[0])
      if (!mindmapData?.nodes || !Array.isArray(mindmapData.nodes)) {
        return NextResponse.json({ error: 'Invalid mind map JSON shape.' }, { status: 502 })
      }

      return NextResponse.json({
        success: true,
        nodes: mindmapData.nodes,
      })
    } catch (parseError) {
      console.error('Failed to parse mind map JSON:', parseError)
      return NextResponse.json({ error: 'Model returned invalid JSON.' }, { status: 502 })
    }
  } catch (error) {
    console.error('Mind map generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate mind map' },
      { status: 500 }
    )
  }
}
