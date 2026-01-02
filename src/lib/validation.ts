import { z } from 'zod'
import { NextRequest } from 'next/server'

// Common validation schemas
export const nonEmptyString = z.string().min(1).max(10000)
export const optionalString = z.string().max(10000).optional()
export const cuid = z.string().cuid()

// User validation
export const userIdSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/, 'Invalid user ID format')

// Grade level validation (6-13, where 13 is undergraduate)
export const gradeLevelSchema = z.number().int().min(6).max(13)

// Interest validation
export const interestSchema = z.string().min(1).max(50).regex(/^[a-zA-Z0-9\s&-]+$/, 'Invalid interest format')

// Learning style validation
export const learningStyleSchema = z.enum(['reading', 'visual', 'auditory', 'kinesthetic'])

// Material validation
export const materialIdSchema = cuid

// Quiz validation
export const quizAnswerSchema = z.record(z.string(), z.number().int().min(0).max(3))

// PDF analysis validation
export const urlSchema = z.string().url().max(2048).refine(
  (url) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  },
  { message: 'Only HTTP/HTTPS URLs are allowed' }
)

// TTS validation
export const ttsSchema = z.object({
  text: z.string().min(1).max(20000),
  voice: z.string().regex(/^[a-zA-Z0-9-+]*$/, 'Invalid voice format').optional(),
  speed: z.number().min(0.5).max(2.0).optional(),
  format: z.enum(['wav']).optional().default('wav'),
})

// Conversational learn validation
export const conversationalLearnSchema = z.object({
  topic: z.string().max(200).optional(),
  question: z.string().min(1).max(2000),
  difficulty: gradeLevelSchema.optional().default(8),
  interest: interestSchema.optional(),
  context: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(2000),
  })).max(10).optional(),
})

// Personalization validation
export const personalizationSchema = z.object({
  text: z.string().min(1).max(50000),
  gradeLevel: gradeLevelSchema,
  interest: interestSchema.optional(),
})

// Quiz generation validation
export const quizGenerationSchema = z.object({
  materialTitle: z.string().min(1).max(200),
  sections: z.array(z.object({
    title: z.string().max(200),
    content: z.string(),
  })).min(1).max(50),
  gradeLevel: gradeLevelSchema.optional(),
  interest: interestSchema.optional(),
  totalQuestions: z.number().int().min(5).max(20).optional(),
})

// Quiz submission validation
export const quizSubmissionSchema = z.object({
  title: z.string().max(200).optional(),
  questions: z.array(z.object({
    id: z.string(),
    correctAnswer: z.number().int().min(0).max(3),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    explanation: z.string().optional(),
  })).min(1).max(50),
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
})

// Slides generation validation
export const slidesGenerationSchema = z.object({
  content: z.string().min(1).max(50000),
  materialTitle: z.string().min(1).max(200),
  gradeLevel: gradeLevelSchema.optional(),
  interest: interestSchema.optional(),
})

// Mindmap generation validation
export const mindmapGenerationSchema = z.object({
  content: z.string().min(1).max(50000),
  materialTitle: z.string().min(1).max(200),
  gradeLevel: gradeLevelSchema.optional(),
  interest: interestSchema.optional(),
})

// Audio generation validation
export const audioGenerationSchema = z.object({
  content: z.string().min(1).max(50000),
  materialTitle: z.string().min(1).max(200),
  gradeLevel: gradeLevelSchema.optional(),
  interest: interestSchema.optional(),
})

// Progress API validation
export const progressActionSchema = z.enum([
  'save-progress',
  'save-preferences',
  'get-progress',
  'get-all-progress',
  'get-preferences',
])

export const saveProgressSchema = z.object({
  action: z.literal('save-progress'),
  userId: userIdSchema.optional(),
  materialId: materialIdSchema,
  currentView: z.enum(['immersive-text', 'slides', 'audio', 'mindmap']).optional(),
  currentSectionIndex: z.number().int().min(0).optional(),
  completedSections: z.array(z.number().int().min(0)).optional(),
  viewedSlides: z.boolean().optional(),
  viewedAudio: z.boolean().optional(),
  viewedMindmap: z.boolean().optional(),
  embeddedQuestionsSeen: z.array(z.string()).optional(),
})

export const savePreferencesSchema = z.object({
  action: z.literal('save-preferences'),
  userId: userIdSchema.optional(),
  gradeLevel: gradeLevelSchema,
  interest: interestSchema.optional(),
  learningStyle: learningStyleSchema.optional(),
  dailyGoal: z.number().int().min(5).max(180).optional(),
})

export const getProgressSchema = z.object({
  action: z.literal('get-progress'),
  userId: userIdSchema.optional(),
  materialId: materialIdSchema,
})

export const getAllProgressSchema = z.object({
  action: z.literal('get-all-progress'),
  userId: userIdSchema.optional(),
})

export const getPreferencesSchema = z.object({
  action: z.literal('get-preferences'),
  userId: userIdSchema.optional(),
})

// Helper function to validate request body
export async function validateRequestBody<T>(request: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      throw new Error(
        `Validation error: ${firstError.path.join('.')} - ${firstError.message}`
      )
    }
    throw error
  }
}

// Sanitize error messages for production
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // In production, don't expose detailed error messages
    if (process.env.NODE_ENV === 'production') {
      return 'An error occurred while processing your request'
    }
    return error.message
  }
  return 'An unknown error occurred'
}