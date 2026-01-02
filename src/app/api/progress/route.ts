import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import {
  saveProgressSchema,
  savePreferencesSchema,
  getProgressSchema,
  getAllProgressSchema,
  getPreferencesSchema,
  sanitizeErrorMessage,
} from '@/lib/validation'

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 })
}

function serverError(message: string = 'Failed to process request') {
  return NextResponse.json({ success: false, error: message }, { status: 500 })
}

async function ensureUser(userId: string) {
  const safeLocal = userId.replace(/[^a-z0-9._-]/gi, '_').slice(0, 64) || 'user'
  const fallbackEmail = `${safeLocal}@example.local`
  return db.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: fallbackEmail,
      gradeLevel: 8,
      interest: null,
      learningStyle: 'reading',
      dailyGoal: 30,
    },
    update: {},
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body?.action

    if (!action) {
      return badRequest('Missing required field: action')
    }

    // Route to appropriate handler based on action
    switch (action) {
      case 'save-progress':
        return await handleSaveProgress(body)
      case 'save-preferences':
        return await handleSavePreferences(body)
      case 'get-progress':
        return await handleGetProgress(body)
      case 'get-all-progress':
        return await handleGetAllProgress(body)
      case 'get-preferences':
        return await handleGetPreferences(body)
      default:
        return badRequest('Invalid action')
    }
  } catch (error) {
    console.error('Progress/Preferences API error:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return badRequest(
        `Validation error: ${firstError.path.join('.')} - ${firstError.message}`
      )
    }
    
    return serverError(sanitizeErrorMessage(error))
  }
}

async function handleSaveProgress(body: any) {
  const validated = saveProgressSchema.parse(body)
  const userId = validated.userId || 'default'
  
  await ensureUser(userId)

  const progress = await db.userProgress.upsert({
    where: {
      userId_materialId: {
        userId,
        materialId: validated.materialId,
      },
    },
    create: {
      userId,
      materialId: validated.materialId,
      currentView: validated.currentView || 'immersive-text',
      currentSectionIndex: validated.currentSectionIndex ?? 0,
      completedSections: JSON.stringify(validated.completedSections || []),
      viewedSlides: validated.viewedSlides ?? false,
      viewedAudio: validated.viewedAudio ?? false,
      viewedMindmap: validated.viewedMindmap ?? false,
      embeddedQuestionsSeen: JSON.stringify(validated.embeddedQuestionsSeen || []),
      lastAccessedAt: new Date(),
    },
    update: {
      currentView: validated.currentView || 'immersive-text',
      currentSectionIndex: validated.currentSectionIndex ?? 0,
      completedSections: JSON.stringify(validated.completedSections || []),
      viewedSlides: validated.viewedSlides ?? false,
      viewedAudio: validated.viewedAudio ?? false,
      viewedMindmap: validated.viewedMindmap ?? false,
      embeddedQuestionsSeen: JSON.stringify(validated.embeddedQuestionsSeen || []),
      lastAccessedAt: new Date(),
    },
  })

  return NextResponse.json({ success: true, progress })
}

async function handleGetAllProgress(body: any) {
  const validated = getAllProgressSchema.parse(body)
  const userId = validated.userId || 'default'
  
  const progress = await db.userProgress.findMany({
    where: { userId },
    orderBy: { lastAccessedAt: 'desc' },
  })

  const materialProgress = progress.map((p) => ({
    materialId: p.materialId,
    title: p.materialId,
    category: 'Unknown',
    progress: Math.max(0, Math.min(100, Math.round((p.currentSectionIndex / 10) * 100))),
    lastAccessed: p.lastAccessedAt.toISOString(),
    currentView: p.currentView,
  }))

  return NextResponse.json({ success: true, progress: materialProgress })
}

async function handleGetProgress(body: any) {
  const validated = getProgressSchema.parse(body)
  const userId = validated.userId || 'default'
  
  const progress = await db.userProgress.findUnique({
    where: { userId_materialId: { userId, materialId: validated.materialId } },
  })

  return NextResponse.json({ success: true, progress })
}

async function handleSavePreferences(body: any) {
  const validated = savePreferencesSchema.parse(body)
  const userId = validated.userId || 'default'
  
  const safeLocal = userId.replace(/[^a-z0-9._-]/gi, '_').slice(0, 64) || 'user'
  const fallbackEmail = `${safeLocal}@example.local`

  const preferences = await db.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: fallbackEmail,
      gradeLevel: validated.gradeLevel,
      interest: validated.interest ?? null,
      learningStyle: validated.learningStyle ?? 'reading',
      dailyGoal: validated.dailyGoal ?? 30,
    },
    update: {
      gradeLevel: validated.gradeLevel,
      interest: validated.interest ?? null,
      learningStyle: validated.learningStyle ?? 'reading',
      dailyGoal: validated.dailyGoal ?? 30,
    },
  })

  return NextResponse.json({ success: true, preferences })
}

async function handleGetPreferences(body: any) {
  const validated = getPreferencesSchema.parse(body)
  const userId = validated.userId || 'default'
  
  const preferences = await db.user.findUnique({ where: { id: userId } })

  return NextResponse.json({
    success: true,
    preferences: preferences
      ? {
          gradeLevel: preferences.gradeLevel ?? 8,
          interest: preferences.interest ?? '',
          learningStyle: (preferences as any).learningStyle ?? 'reading',
          dailyGoal: (preferences as any).dailyGoal ?? 30,
        }
      : {
          gradeLevel: 8,
          interest: '',
          learningStyle: 'reading',
          dailyGoal: 30,
        },
  })
}