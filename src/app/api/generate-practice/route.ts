import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/zai'

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, interest } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Missing required field: topic' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert educator specializing in creating practice problems that test understanding and reinforce learning. Your problems help learners gauge their mastery and identify areas needing more focus.

Problem Design Principles:
1. Problems should be challenging but achievable - not too easy, not too hard
2. Test different levels of understanding:
   - Recall: Basic facts and definitions
   - Application: Using concepts in scenarios
   - Analysis: Breaking down complex situations
   - Synthesis: Combining concepts to create new understanding
3. Use contexts that relate to learner's interests when possible
4. Provide immediate, helpful feedback
5. Explain the reasoning behind correct answers

Problem Types:
Create a mix of:

1. Multiple Choice (2-3 problems)
   - 4 options with one clearly correct answer
   - 3 plausible distractors that test common misconceptions
   - Explanations for why correct answer is right and others are wrong

2. True/False or Yes/No (1 problem)
   - Quick checks on understanding
   - Requires justification for false answers

3. Fill-in-the-blank (1 problem)
   - Tests recall of key terms or formulas
   - Provides context clues

4. Short Answer (1 problem)
   - Demonstrates application or explanation ability
   - Should be answerable in 2-3 sentences

Difficulty Adaptation:
- Level 6-7: Basic recall and simple application (everyday scenarios)
- Level 8-10: Application and beginning analysis (school project scenarios)
- Level 11-13: Analysis and synthesis (professional or academic contexts)

Interest Integration:
${interest ? `- Incorporate ${interest} into problem scenarios when natural` : '- Use universally understood contexts (work, school, daily life)'}

Feedback Quality:
For each problem, provide:
- Clear explanation of the correct answer
- Why other options are incorrect (for multiple choice)
- Connection back to the core concept
- Hint on what to review if they get it wrong

Output Format:
Return a JSON object:
{
  "type": "practice",
  "content": "Introductory text encouraging practice",
  "metadata": {
    "topic": "${topic}",
    "difficulty": ${difficulty || 7},
    "practiceProblems": [
      {
        "id": "unique-id",
        "type": "multiple-choice" | "true-false" | "fill-blank" | "short-answer",
        "question": "The problem question",
        "options": ["Option A", "Option B", "Option C", "Option D"], // Only for multiple-choice
        "correctAnswer": 0, // Index of correct answer or true for T/F
        "explanation": "Detailed explanation of correct answer",
        "hint": "Optional hint if they're stuck"
      }
    ]
  }
}

Quality Guidelines:
- Problems should feel relevant and engaging
- Avoid trick questions - test understanding, not cleverness
- Progressively increase complexity within the set
- Each problem should clearly test one main idea
- Include variety to test different aspects of understanding`

    const userPrompt = `Generate 4-5 practice problems that test understanding of the following topic.

Topic: ${topic}
Difficulty Level: ${difficulty || 7}
Learner Interest: ${interest || 'Not specified'}

Create problems that help the learner:
1. Check what they understand
2. Identify areas needing more review
3. Apply concepts in new situations
4. Build confidence through practice

Include immediate feedback and explanations for each problem.`

    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 800,
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
