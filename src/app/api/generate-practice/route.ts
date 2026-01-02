import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, interest, aiConfig } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Missing required field: topic' },
        { status: 400 }
      )
    }

    // Call the LLM
    const response = await llmChat({
      system: `You are an expert tutor specializing in creating effective practice problems that check understanding and reinforce learning.

Design Principles:
1. Test different levels of mastery:
   - Recall: Basic facts and definitions
   - Application: Using concepts in scenarios
   - Analysis: Breaking down complex situations (higher difficulty)
   - Synthesis: Combining concepts to create new understanding (highest difficulty)
2. Use contexts that relate to learner interests (${interest || 'general'})
3. Provide immediate, helpful feedback for both correct and incorrect answers
4. Explain the *reasoning* behind the correct answer, not just "Correct"
5. Problem types should be varied (Multiple Choice, True/False, Short Scenario)

Difficulty Level: ${difficulty || 7} (Scale 6-13)
- Level 6-7: Focus on recall and simple application, everyday scenarios
- Level 8-10: Analysis and synthesis, professional or academic contexts
- Level 11-13: Complex Analysis, critical thinking, abstract scenarios

Output Format:
Return a JSON object:
{
  "type": "practice",
  "content": "Brief intro text encouraging practice",
  "metadata": {
    "topic": "${topic}",
    "difficulty": ${difficulty || 7},
    "practiceProblems": [
      {
        "id": "1",
        "question": "The problem question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0, // Index of correct option (0-3)
        "explanation": "Detailed explanation of why the answer is correct and others are wrong"
      }
    ]
  }
}

Guidelines:
- Create 3-4 problems
- Ensure one and only one option is correct
- Make distractors (wrong answers) plausible to test common misconceptions
- Explanations should be educational, not just corrections
- Avoid trick questions; test understanding, not cleverness`,
      messages: [{ role: 'user', content: `Create practice problems for: ${topic}` }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      provider: aiConfig?.provider,
      apiKey: aiConfig?.apiKey,
      baseUrl: aiConfig?.baseUrl,
      model: aiConfig?.model,
    })

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
         // Fallback if no JSON
         return NextResponse.json({
             success: true,
             content: response.text,
             type: 'practice', 
             metadata: { topic, difficulty, practiceProblems: [] }
         })
      }

      const responseData = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        success: true,
        ...responseData,
      })
    } catch (e) {
      console.error('Failed to parse practice JSON:', e)
      return NextResponse.json({ error: 'Model returned invalid JSON.' }, { status: 502 })
    }
  } catch (error) {
    console.error('Practice generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate practice problems' },
      { status: 500 }
    )
  }
}
