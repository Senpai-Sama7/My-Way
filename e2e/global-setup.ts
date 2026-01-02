import { loadEnvConfig } from '@next/env'
import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_DB_URL = 'file:./db/custom.db'
const DEFAULT_LLM_BASE_URL = 'http://127.0.0.1:11434/api/chat'
const DEFAULT_LLM_MODEL = 'qwen3-4b'
const LLM_TIMEOUT_MS = 60_000
const LLM_RETRY_DELAY_MS = 2_000
const LLM_REQUEST_TIMEOUT_MS = 30_000

function loadEnv() {
  loadEnvConfig(process.cwd())

  // Explicitly set DATABASE_URL since loadEnvConfig might not be working
  process.env.DATABASE_URL = DEFAULT_DB_URL

  if (!process.env.LLM_BASE_URL) {
    process.env.LLM_BASE_URL = DEFAULT_LLM_BASE_URL
  }

  if (!process.env.LLM_MODEL) {
    process.env.LLM_MODEL = DEFAULT_LLM_MODEL
  }
}

async function ensureScreenshotsDir() {
  const shotsDir = path.join(process.cwd(), 'screenshots')
  await fs.mkdir(shotsDir, { recursive: true })
}

async function ensureDatabase() {
  execSync('bun run db:push', {
    stdio: 'inherit',
    env: process.env,
  })
}

async function waitForLlm() {
  const baseUrl = process.env.LLM_BASE_URL || DEFAULT_LLM_BASE_URL
  const model = process.env.LLM_MODEL || DEFAULT_LLM_MODEL
  const apiKey = process.env.LLM_API_KEY
  const startedAt = Date.now()
  let lastError = ''

  while (Date.now() - startedAt < LLM_TIMEOUT_MS) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), LLM_REQUEST_TIMEOUT_MS)

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Reply with the single word PONG.' }],
          max_tokens: 8,
          stream: false,
        }),
      })

      clearTimeout(timeout)

      if (response.ok) {
        const data = await response.json().catch(() => null)
        const text =
          data?.choices?.[0]?.message?.content ??
          data?.message?.content ??
          data?.choices?.[0]?.text ??
          data?.text ??
          ''

        if (typeof text === 'string' && text.trim()) {
          return
        }

        lastError = 'LLM responded without text'
      } else {
        const body = await response.text().catch(() => '')
        lastError = `HTTP ${response.status} ${body}`.trim()
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'LLM request failed'
    }

    await new Promise((resolve) => setTimeout(resolve, LLM_RETRY_DELAY_MS))
  }

  throw new Error(
    `LLM not reachable at ${baseUrl}. Last error: ${lastError || 'unknown error'}. ` +
      'Start Ollama (e.g., `ollama serve`) and ensure the model is available.'
  )
}

export default async function globalSetup() {
  loadEnv()
  await ensureScreenshotsDir()
  await ensureDatabase()
  await waitForLlm()
}