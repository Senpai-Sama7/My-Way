import { NextRequest, NextResponse } from 'next/server'
import { llmChat } from '@/lib/ai-client'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const MAX_PDF_BYTES = 12 * 1024 * 1024 // 12MB
const MAX_PAGES = 30
const MAX_EXTRACTED_CHARS = 180_000

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().trim()
  if (!host) return true
  if (host === 'localhost' || host.endsWith('.localhost')) return true
  if (host.endsWith('.local')) return true

  // Block obvious private IP literals (IPv4)
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4Match) {
    const parts = ipv4Match.slice(1).map((n) => Number(n))
    if (parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return true
    const [a, b] = parts
    if (a === 10) return true
    if (a === 127) return true
    if (a === 0) return true
    if (a === 169 && b === 254) return true // link-local
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    return false
  }

  // Block obvious loopback/unique-local IPv6 literals
  if (host === '::1') return true
  if (host.startsWith('fc') || host.startsWith('fd')) return true // unique local

  return false
}

async function extractPdfText(bytes: ArrayBuffer): Promise<string> {
  const header = new TextDecoder('utf-8').decode(new Uint8Array(bytes, 0, 4))
  if (header !== '%PDF') throw new Error('Invalid PDF file (missing %PDF header)')

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  try {
    const require = createRequire(import.meta.url)
    const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString()
  } catch (error) {
    console.warn('PDF worker setup warning:', error)
  }
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    disableWorker: true,
  } as any)
  const pdf = await loadingTask.promise

  let out = ''
  const pageCount = Math.min(pdf.numPages ?? 0, MAX_PAGES)

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const items = (textContent.items ?? []) as Array<{ str?: string }>
    const pageText = items
      .map((i) => (typeof i.str === 'string' ? i.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (pageText) {
      out += `\n\n--- Page ${pageNumber} ---\n\n${pageText}`
      if (out.length >= MAX_EXTRACTED_CHARS) break
    }
  }

  return out.trim()
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')

    let pdfText = ''

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()

      if (bytes.byteLength > MAX_PDF_BYTES) {
        return NextResponse.json(
          { error: `PDF too large. Max size is ${Math.round(MAX_PDF_BYTES / (1024 * 1024))}MB.` },
          { status: 413 }
        )
      }

      pdfText = await extractPdfText(bytes)
    } else {
      // Handle URL input
      const { url } = await request.json()

      if (!url) {
        return NextResponse.json(
          { error: 'No URL provided' },
          { status: 400 }
        )
      }

      let parsedUrl: URL
      try {
        parsedUrl = new URL(url)
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return NextResponse.json({ error: 'Only http(s) URLs are supported' }, { status: 400 })
      }

      if (isBlockedHostname(parsedUrl.hostname)) {
        return NextResponse.json({ error: 'Blocked URL host' }, { status: 400 })
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15_000)

      let res: Response
      try {
        res = await fetch(parsedUrl.toString(), {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeout)
      }

      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch PDF (HTTP ${res.status})` },
          { status: 502 }
        )
      }

      const contentLengthHeader = res.headers.get('content-length')
      if (contentLengthHeader) {
        const contentLength = Number(contentLengthHeader)
        if (Number.isFinite(contentLength) && contentLength > MAX_PDF_BYTES) {
          return NextResponse.json(
            { error: `PDF too large. Max size is ${Math.round(MAX_PDF_BYTES / (1024 * 1024))}MB.` },
            { status: 413 }
          )
        }
      }

      const bytes = await res.arrayBuffer()
      if (bytes.byteLength > MAX_PDF_BYTES) {
        return NextResponse.json(
          { error: `PDF too large. Max size is ${Math.round(MAX_PDF_BYTES / (1024 * 1024))}MB.` },
          { status: 413 }
        )
      }

      pdfText = await extractPdfText(bytes)
    }

    if (!pdfText || pdfText.length < 200) {
      return NextResponse.json(
        { error: 'Unable to extract readable text from this PDF.' },
        { status: 422 }
      )
    }

    const MAX_LLM_INPUT_CHARS = 4_000
    const llmInputText = pdfText.length > MAX_LLM_INPUT_CHARS
      ? pdfText.slice(0, MAX_LLM_INPUT_CHARS)
      : pdfText

    // Generate summary
    const summaryPrompt = `Please provide a comprehensive summary of the following text. The summary should:
- Capture the main ideas and key points
- Be approximately 200-300 words
- Be clear and concise

Text:
${llmInputText}`

    const summaryResponse = await llmChat({
      messages: [{ role: 'user', content: summaryPrompt }],
      temperature: 0.5,
      max_tokens: 300,
    })

    // Generate key concepts
    const conceptsPrompt = `Extract and explain the key concepts from the following text. For each concept, provide:
1. The term or idea
2. A clear definition or explanation
3. An importance rating (high, medium, low)

    Return a JSON array:
[
  {
    "id": "unique-id",
    "term": "Concept name",
    "definition": "Clear definition",
    "importance": "high" | "medium" | "low"
  }
]

Text:
${llmInputText}`

    const conceptsResponse = await llmChat({
      messages: [{ role: 'user', content: conceptsPrompt }],
      temperature: 0.5,
      max_tokens: 400,
    })

    let keyConcepts = []
    try {
      const jsonMatch = conceptsResponse.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        keyConcepts = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.warn('Failed to parse concepts JSON:', e)
    }

    // Generate questions
    const questionsPrompt = `Generate 8-12 questions to guide reading and test understanding of this text. Include a mix of:
- Factual questions (easy) - testing basic recall
- Comprehension questions (medium) - testing understanding
- Analysis questions (hard) - testing deeper insight

    Return a JSON array:
[
  {
    "id": "unique-id",
    "question": "Question text",
    "answer": "Clear, comprehensive answer",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Text:
${llmInputText}`

    const questionsResponse = await llmChat({
      messages: [{ role: 'user', content: questionsPrompt }],
      temperature: 0.7,
      max_tokens: 400,
    })

    let questions = []
    try {
      const jsonMatch = questionsResponse.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.warn('Failed to parse questions JSON:', e)
    }

    // Extract sections if possible
    const sectionsPrompt = `Identify the main sections of this text. For each section:
1. Provide a clear title
2. Provide a brief 2-3 sentence summary of what would be covered

    Return a JSON array:
[
  {
    "title": "Section title",
    "content": "Brief 2-3 sentence summary"
  }
]

Text:
${llmInputText}`

    const sectionsResponse = await llmChat({
      messages: [{ role: 'user', content: sectionsPrompt }],
      temperature: 0.5,
      max_tokens: 300,
    })

    let sections = []
    try {
      const jsonMatch = sectionsResponse.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        sections = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.warn('Failed to parse sections JSON:', e)
    }

    return NextResponse.json({
      success: true,
      summary: summaryResponse.text,
      keyConcepts,
      questions,
      sections,
    })
  } catch (error) {
    console.error('PDF analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze PDF' },
      { status: 500 }
    )
  }
}
