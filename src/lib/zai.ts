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
  response_format?: any
  stream?: boolean
}

const defaultBaseUrl = process.env.LLM_BASE_URL ?? 'http://127.0.0.1:11434/api/chat'
const defaultModel = process.env.LLM_MODEL ?? 'qwen3-4b'
const defaultMaxTokens = Number(process.env.LLM_MAX_TOKENS ?? 256)

export async function llmChat(options: LlmChatOptions): Promise<{ text: string; raw: any }> {
  const baseUrl = options['baseUrl'] || defaultBaseUrl
  const model = options.model ?? defaultModel
  const apiKey = process.env.LLM_API_KEY

  const payload: any = {
    model,
    messages: options.system
      ? [{ role: 'system', content: options.system }, ...options.messages]
      : options.messages,
  }

  const wantsJson = options.response_format?.type === 'json_object'
  if (wantsJson && payload.format === undefined) {
    payload.format = 'json'
  }

  const optionsPayload: Record<string, number> = {}

  if (options.temperature !== undefined) {
    payload.temperature = options.temperature
    optionsPayload.temperature = options.temperature
  }

  const maxTokens =
    options.max_tokens !== undefined
      ? options.max_tokens
      : Number.isFinite(defaultMaxTokens) && defaultMaxTokens > 0
        ? defaultMaxTokens
        : undefined

  if (maxTokens !== undefined) {
    payload.max_tokens = maxTokens
    optionsPayload.num_predict = maxTokens
  }

  if (Object.keys(optionsPayload).length > 0) {
    payload.options = { ...(payload.options ?? {}), ...optionsPayload }
  }

  if (options.response_format !== undefined) {
    payload.response_format = options.response_format
  }

  if (options.stream !== undefined) {
    payload.stream = options.stream
  } else {
    payload.stream = false
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`LLM request failed (${response.status}): ${body}`)
  }

  const raw = await response.json().catch((error) => {
    throw new Error(`Failed to parse LLM response: ${error}`)
  })

  const text =
    raw?.choices?.[0]?.message?.content ??
    raw?.choices?.[0]?.text ??
    raw?.message?.content ??
    raw?.text ??
    ''

  return { text: typeof text === 'string' ? text : '', raw }
}
