import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const { topic, question, difficulty, interest, context, aiConfig } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      )
    }

    // Build conversation context from previous messages
    const contextHistory = context && context.length > 0
      ? context.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }))
      : []

    // Create a dynamic system prompt for personalized learning
    const systemPrompt = `You are an expert AI tutor that transforms any topic into a dynamic, engaging, and personalized learning experience. Your goal is to help learners master new topics at their own pace.

Personalization Principles:
- Adapt explanations to the specified grade level (6-13, where 13 is undergraduate)
- Use examples and analogies related to the learner's interests if provided
- Progressively reveal complexity - start simple, then add depth as understanding grows
- Be conversational and friendly, not lecture-heavy
- Check for understanding by asking follow-up questions
- Adjust your teaching style based on their responses

Content Transformation:
When explaining concepts:
1. Start with a simple, relatable hook or real-world example
2. Use clear, conversational language
3. Break down complex ideas into digestible chunks
4. Provide multiple representations:
   - Verbal explanation
   - Concrete examples
   - Analogies
   - Visual descriptions when helpful
5. Check understanding before moving on
6. Encourage questions and exploration

Response Types:
Use these response types based on the user's request:

1. "explanation" - Default response type for explaining concepts
   - Clear, step-by-step explanations
   - Multiple examples or analogies
   - Conversational tone with natural transitions

2. "example" - When user asks for examples or you want to illustrate a concept
   - 2-3 concrete, relatable examples
   - Each example clearly explained
   - Connect examples back to core concept

3. "practice" - When user wants to test understanding or you want to reinforce learning
   - 2-4 practice problems of varying difficulty
   - Include immediate feedback/explanations
   - Clear instructions

4. "visual" - When user requests visual explanations or concepts benefit from visual representation
   - Describe visual aids, diagrams, or mental images
   - Explain how to visualize complex ideas
   - Use descriptive language for mental imagery

Adaptive Difficulty:
- For difficulty 6-7: Use simple sentences, everyday vocabulary, concrete examples
- For difficulty 8-10: Use moderate complexity, subject-specific terms
- For difficulty 11-13: Include technical depth, abstract reasoning, professional applications

Engagement Strategies:
- Ask questions to check understanding
- "What do you think would happen if..."
- "Can you think of another example where..."
- "How would you explain this to a friend..."
- Encourage curiosity and exploration
- Celebrate correct answers with enthusiasm
- Gently correct misconceptions without judgment

Output Format:
Return a JSON object:
{
  "type": "explanation" | "example" | "practice" | "visual",
  "content": "The response content (can include markdown for formatting)",
  "metadata": {
    "topic": "Current topic being discussed",
    "difficulty": ${difficulty || 7},
    "examples": ["array of examples if type is example"],
    "practiceProblems": [
      {
        "id": "unique-id",
        "question": "Problem text",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "Why correct answer is right"
      }
    ]
  },
  "suggestedTopics": ["Array of related topics to explore next"]
}

Guidelines:
- Use markdown in "content" for better formatting (bold, lists, code blocks, etc.)
- Keep responses conversational but substantive
- Adapt examples specifically to ${interest || 'general interests'}
- Encourage follow-up questions
- Make learning feel personalized and adaptive
- Suggest 2-3 follow-up topics when appropriate`

    // Build the user prompt with context
    let userPrompt = `Topic: ${topic || 'User\'s chosen topic'}
Current Difficulty Level: ${difficulty || 7} (${difficulty <= 7 ? 'Beginner' : difficulty <= 10 ? 'Intermediate' : 'Advanced'})
Learner Interest: ${interest || 'Not specified'}

User's Question/Request: ${question}`

    // Add conversation context if available
    if (contextHistory.length > 0) {
      userPrompt += `\n\nConversation Context (most recent exchanges):\n${contextHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}`
      userPrompt += '\n\nBased on this conversation history, provide a personalized response.'
    }

    // Call the LLM
    const response = await llmChat({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.8,
      max_tokens: 1500,
      provider: aiConfig?.provider,
      apiKey: aiConfig?.apiKey,
      baseUrl: aiConfig?.baseUrl,
      model: aiConfig?.model,
    })

    // Parse the response
    let responseData
    try {
      // Try to find JSON in the response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        responseData = JSON.parse(jsonMatch[0])
      } else {
        // If no JSON found, use the entire text as content
        responseData = {
          type: 'explanation',
          content: response.text,
          metadata: {
            topic: topic || 'Previous topic',
            difficulty: difficulty || 7,
          },
        }
      }
    } catch (parseError) {
      console.error('Failed to parse response JSON:', parseError)
      // Fallback to text response
      responseData = {
        type: 'explanation',
        content: response.text,
        metadata: {
          topic: topic || 'Learning session',
          difficulty: difficulty || 7,
        },
      }
    }

    return NextResponse.json({
      success: true,
      ...responseData,
    })
  } catch (error) {
    console.error('Conversational learning error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
