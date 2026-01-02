// Error handling utilities with retry logic.

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10_000,
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay } = { ...defaultRetryConfig, ...config }

  let lastError: unknown
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt >= maxRetries - 1) throw error

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`, error)
      await new Promise<void>((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Retry failed')
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config?: Partial<RetryConfig>,
): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response
  }, config)
}

export enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  SERVER = 'server',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

export function classifyError(error: unknown): ErrorType {
  if (!(error instanceof Error)) return ErrorType.UNKNOWN

  const message = error.message.toLowerCase()
  if (message.includes('timeout')) return ErrorType.TIMEOUT
  if (message.includes('network') || message.includes('fetch')) return ErrorType.NETWORK
  if (message.includes('401') || message.includes('403')) return ErrorType.VALIDATION
  if (message.includes('500') || message.includes('502') || message.includes('503')) return ErrorType.SERVER

  return ErrorType.UNKNOWN
}

export function getUserFriendlyMessage(error: Error): string {
  const errorType = classifyError(error)

  const messages: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: 'Unable to connect. Please check your internet connection.',
    [ErrorType.TIMEOUT]: 'Request took too long. Please try again.',
    [ErrorType.VALIDATION]: 'Please check your input and try again.',
    [ErrorType.SERVER]: 'Server error. Please try again later.',
    [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  }

  return messages[errorType]
}

export function getFallbackContent(
  type: 'personalize' | 'generate-questions' | 'generate-audio',
): unknown {
  const fallbacks: Record<string, unknown> = {
    personalize: {
      content:
        'Unable to personalize content at this time. The original content will be displayed.',
      type: 'explanation',
    },
    'generate-questions': {
      question: 'What is the main concept of this section?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Please review the section to understand the main concept.',
      difficulty: 'easy',
    },
    'generate-audio': {
      conversation: [
        {
          speaker: 'teacher',
          text: 'Welcome to this audio lesson. Due to technical difficulties, the full audio lesson is not available at this time.',
        },
        {
          speaker: 'student',
          text: 'I understand. Is there an alternative way to learn this material?',
        },
      ],
      visuals: ['Full audio lesson coming soon'],
    },
  }

  return fallbacks[type] ?? { content: 'Content temporarily unavailable.', type: 'explanation' }
}

export function logError(error: Error, context: string): void {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  }

  console.error('[Error]', JSON.stringify(errorData, null, 2))
}

export async function safeApiCall<T>(
  fn: () => Promise<T>,
  fallback?: () => T,
  context?: string,
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    logError(error as Error, context || 'API call')
    if (fallback) return fallback()
    throw error
  }
}
