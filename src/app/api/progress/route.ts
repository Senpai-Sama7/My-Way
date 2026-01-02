import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type ProgressAction =
  | 'save-progress'
  | 'save-preferences'
  | 'get-progress'
  | 'get-all-progress'
  | 'get-preferences'

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 })
}

function serverError() {
  return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 })
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
    let body: any
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON body')
    }

    const action = body?.action as ProgressAction | undefined
    const userId = (body?.userId as string | undefined) || 'default'

    if (!action) return badRequest('Missing required field: action')

    if (action === 'save-progress') {
      const materialId = body?.materialId as string | undefined
      if (!materialId) return badRequest('Missing required field: materialId')

      await ensureUser(userId)

      const progress = await db.userProgress.upsert({
        where: {
          userId_materialId: {
            userId,
            materialId,
          },
        },
        create: {
          userId,
          materialId,
          currentView: body?.currentView || 'immersive-text',
          currentSectionIndex: body?.currentSectionIndex ?? 0,
          completedSections: JSON.stringify(body?.completedSections || []),
          viewedSlides: !!body?.viewedSlides,
          viewedAudio: !!body?.viewedAudio,
          viewedMindmap: !!body?.viewedMindmap,
          embeddedQuestionsSeen: JSON.stringify(body?.embeddedQuestionsSeen || []),
          lastAccessedAt: new Date(),
        },
        update: {
          currentView: body?.currentView || 'immersive-text',
          currentSectionIndex: body?.currentSectionIndex ?? 0,
          completedSections: JSON.stringify(body?.completedSections || []),
          viewedSlides: !!body?.viewedSlides,
          viewedAudio: !!body?.viewedAudio,
          viewedMindmap: !!body?.viewedMindmap,
          embeddedQuestionsSeen: JSON.stringify(body?.embeddedQuestionsSeen || []),
          lastAccessedAt: new Date(),
        },
      })

      return NextResponse.json({ success: true, progress })
    }

    if (action === 'get-all-progress') {
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

    if (action === 'get-progress') {
      const materialId = body?.materialId as string | undefined
      if (!materialId) return badRequest('Missing required field: materialId')

      const progress = await db.userProgress.findUnique({
        where: { userId_materialId: { userId, materialId } },
      })

      return NextResponse.json({ success: true, progress })
    }

    if (action === 'save-preferences') {
      const gradeLevel = body?.gradeLevel as number | undefined
      if (gradeLevel === undefined) return badRequest('Missing required field: gradeLevel')

      const safeLocal = userId.replace(/[^a-z0-9._-]/gi, '_').slice(0, 64) || 'user'
      const fallbackEmail = `${safeLocal}@example.local`

      const preferences = await db.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: fallbackEmail,
          gradeLevel,
          interest: body?.interest ?? null,
          learningStyle: body?.learningStyle ?? 'reading',
          dailyGoal: body?.dailyGoal ?? 30,
        },
        update: {
          gradeLevel,
          interest: body?.interest ?? null,
          learningStyle: body?.learningStyle ?? 'reading',
          dailyGoal: body?.dailyGoal ?? 30,
        },
      })

      return NextResponse.json({ success: true, preferences })
    }

    if (action === 'get-preferences') {
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

    return badRequest('Invalid action')
  } catch (error) {
    console.error('Progress/Preferences API error:', error)
    return serverError()
  }
}
