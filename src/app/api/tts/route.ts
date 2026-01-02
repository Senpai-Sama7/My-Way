import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const MAX_TTS_CHARS = 20_000
const DEFAULT_WPM = 175
const MIN_WPM = 80
const MAX_WPM = 450
const execFileAsync = promisify(execFile)

export async function POST(request: NextRequest) {
  try {
    const { text, voice, speed, format } = await request.json()

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Missing required field: text' }, { status: 400 })
    }

    const trimmed = text.trim()
    if (trimmed.length > MAX_TTS_CHARS) {
      return NextResponse.json(
        { error: `Text too long for TTS. Max ${MAX_TTS_CHARS} characters.` },
        { status: 413 }
      )
    }

    const resolvedFormat = typeof format === 'string' && format.trim() ? format.trim().toLowerCase() : 'wav'
    if (resolvedFormat !== 'wav') {
      return NextResponse.json({ error: 'Only wav output is supported for local TTS.' }, { status: 400 })
    }

    // Sanitize voice parameter to prevent command injection
    let voiceArg = ''
    if (typeof voice === 'string' && voice.trim()) {
      voiceArg = voice.trim().replace(/[^a-zA-Z0-9-+]/g, '') // Only allow alphanumeric, hyphen, plus
      if (!voiceArg) {
        return NextResponse.json(
          { error: 'Invalid voice parameter. Only alphanumeric characters, hyphens, and plus signs are allowed.' },
          { status: 400 }
        )
      }
    }
    
    const wpmRaw = typeof speed === 'number' ? Math.round(DEFAULT_WPM * speed) : DEFAULT_WPM
    const wpm = Math.min(MAX_WPM, Math.max(MIN_WPM, wpmRaw))

    const tmpName = `tts-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`
    const tmpPath = path.join(os.tmpdir(), tmpName)

    try {
      const args = ['-w', tmpPath, '-s', String(wpm)]
      if (voiceArg) args.push('-v', voiceArg)
      args.push(trimmed)

      await execFileAsync('espeak-ng', args)

      const buffer = await fs.readFile(tmpPath)
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'no-store',
        },
      })
    } finally {
      await fs.unlink(tmpPath).catch(() => {})
    }
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 })
  }
}