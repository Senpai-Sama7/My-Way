export type LlmRole = 'system' | 'user' | 'assistant'

export type LlmMessage = {
  role: LlmRole
  content: string
}

export type LlmChatOptions = {
  model?: string
  system?: string
  messages: Array<Omit<LlmMessage, 'role'> & { role: Exclude<LlmRole, 'system'> }>
  temperature?: number
  max_tokens?: number
  baseUrl?: string
  response_format?: { type: 'json_object' | 'text' }
  stream?: boolean
  provider?: string
  apiKey?: string
}

type LlmProvider = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama' | 'local'

export async function llmChat(options: LlmChatOptions): Promise<{ text: string; raw: any }> {
  // 1. Configuration
  const provider = (options.provider || process.env.LLM_PROVIDER || 'ollama').toLowerCase() as LlmProvider
  const apiKey = options.apiKey || process.env.LLM_API_KEY || ''
  const requestedModel = options.model || process.env.LLM_MODEL
  const defaultBaseUrl = getTypeCompatibleBaseUrl(provider)
  
  // Allow override from options, then env, then provider default
  let baseUrl = options.baseUrl || process.env.LLM_BASE_URL || defaultBaseUrl

  // Ensure full URL for chat completions if not provided
  if (!baseUrl.endsWith('/chat/completions') && !baseUrl.includes('/generate')) {
    // If it's just the host root or v1 root, append the standard endpoint
    if (baseUrl.endsWith('/v1')) {
      baseUrl = `${baseUrl}/chat/completions`
    } else if (baseUrl.endsWith('/v1beta')) {
        // Gemini
       baseUrl = `${baseUrl}/openai/chat/completions`
    } else if (provider === 'ollama' && !baseUrl.includes('api/')) {
       // Assume localhost:11434 root
       baseUrl = baseUrl.replace(/\/$/, '') + '/v1/chat/completions'
    } else if (!baseUrl.endsWith('/')) {
       baseUrl = `${baseUrl}/chat/completions`
    }
  }

  // 2. Select Model
  // Defaults if not specified
  let model = requestedModel
  if (!model) {
    switch (provider) {
      case 'openai': model = 'gpt-4o'; break;
      case 'gemini': model = 'gemini-2.0-flash'; break;
      case 'openrouter': model = 'meta-llama/llama-3-8b-instruct:free'; break; // Example free model
      case 'ollama': model = 'llama3.1'; break;
      default: model = 'gpt-3.5-turbo';
    }
  }

  // 3. Construct Headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }
  
  // Provider specific headers
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://localhost:3000' // Required by OpenRouter
    headers['X-Title'] = 'Learn Your Way'
  }

  // 4. Construct Payload (Standard OpenAI Format)
  const messages: LlmMessage[] = []
  if (options.system) {
    messages.push({ role: 'system', content: options.system })
  }
  messages.push(...options.messages)

  const payload: any = {
    model,
    messages,
    stream: options.stream ?? false,
  }

  if (options.temperature !== undefined) payload.temperature = options.temperature
  if (options.max_tokens !== undefined) payload.max_tokens = options.max_tokens
  
  // Handle response_format
  if (options.response_format?.type === 'json_object') {
    // OpenAI/v1 standard
    payload.response_format = { type: 'json_object' }
  }

  // 5. Execute Request
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`LLM provider '${provider}' request failed (${response.status}): ${body}`)
    }

    const data = await response.json()

    // 6. Parse Response (Standard OpenAI Format)
    let text = ''
    if (data.choices && data.choices.length > 0) {
      text = data.choices[0].message?.content || data.choices[0].text || ''
    } else if (data.message) {
      // Direct message content (some ollama/legacy formats)
      text = data.message.content
    } else if (typeof data.response === 'string') {
      // Legacy Ollama /api/generate
      text = data.response
    }

    return { text, raw: data }

  } catch (error) {
    console.error('[AI Client] Error:', error)
    throw error // Re-throw for API routes to handle
  }
}

function getTypeCompatibleBaseUrl(provider: LlmProvider): string {
  switch (provider) {
    case 'openai': return 'https://api.openai.com/v1/chat/completions'
    case 'gemini': return 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
    case 'openrouter': return 'https://openrouter.ai/api/v1/chat/completions'
    case 'ollama': return 'http://127.0.0.1:11434/v1/chat/completions'
    case 'local': return 'http://127.0.0.1:1234/v1/chat/completions' // LM Studio default
    default: return 'http://127.0.0.1:11434/v1/chat/completions'
  }
}
