import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/ai-client'
import { db } from '@/lib/db'

type CheckResult = {
  ok: boolean
  detail?: string
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const deep = url.searchParams.get('deep') === '1'

  const checks: Record<string, CheckResult> = {}

  const envOk = Boolean(process.env.LLM_PROVIDER || process.env.LLM_BASE_URL || process.env.LLM_MODEL) && Boolean(process.env.DATABASE_URL)
  checks.env = {
    ok: envOk,
    detail: envOk ? 'Env vars present' : 'Missing LLM_BASE_URL/LLM_MODEL or DATABASE_URL',
  }

  if (deep) {
    try {
      await db.$queryRaw`SELECT 1`
      checks.database = { ok: true, detail: 'Connected' }
    } catch (error) {
      checks.database = { ok: false, detail: error instanceof Error ? error.message : 'DB error' }
    }

    try {
      const result = await llmChat({
        messages: [{ role: 'user', content: 'Reply with the single word PONG.' }],
        max_tokens: 256,
        temperature: 0,
      })
      checks.llm = { ok: Boolean(result.text), detail: result.text ? 'Responded' : 'No response text' }
    } catch (error) {
      checks.llm = { ok: false, detail: error instanceof Error ? error.message : 'LLM error' }
    }
  }

  const ok = Object.values(checks).every((c) => c.ok)

  return NextResponse.json({
    ok,
    checks,
    timestamp: new Date().toISOString(),
  })
}
